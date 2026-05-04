import { create } from "zustand";
import { apiService } from "../services/api";
import type { ModelState, AIModel } from "../types";

type RawModel = Record<string, unknown>;

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

const asArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

// Función para normalizar modelos del backend
const normalizeModel = (model: RawModel): AIModel => {
  const features = asArray(model.features);
  const supportsImages =
    features.includes("multimodal") ||
    asBoolean(model.supportsImages) ||
    asBoolean(model.supports_images);
  const supportsReasoning = features.includes("advanced") || asBoolean(model.supportsReasoning);
  const supportsWebsiteAgent =
    features.includes("website_agent") ||
    asBoolean(model.supportsWebsiteAgent) ||
    asBoolean(model.supports_website_agent);
  const available =
    model.available !== undefined
      ? asBoolean(model.available)
      : asBoolean(model.isAvailable, true);
  const isPremium =
    model.premium !== undefined
      ? asBoolean(model.premium)
      : model.is_premium !== undefined
        ? asBoolean(model.is_premium)
        : asBoolean(model.isPremium);

  return {
    id: asString(model.id),
    name: asString(model.name, asString(model.display_name)),
    provider: asString(model.provider) as AIModel["provider"],
    description: asString(model.description),
    maxTokens:
      typeof model.maxTokens === "number"
        ? model.maxTokens
        : typeof model.max_tokens === "number"
          ? model.max_tokens
          : undefined,
    maxOutputTokens:
      typeof model.maxOutputTokens === "number"
        ? model.maxOutputTokens
        : typeof model.max_output_tokens === "number"
          ? model.max_output_tokens
          : undefined,
    supportsImages,
    supportsWebsiteAgent,
    supportsReasoning,
    isPremium,
    isAvailable: available,
    available,
    features,
  };
};

interface ModelStore extends ModelState {
  // Actions
  loadModels: () => Promise<void>;
  selectModel: (model: AIModel) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useModelStore = create<ModelStore>()((set) => ({
  // Estado inicial - empezar vacío para forzar carga desde backend
  models: [],
  selectedModel: null,
  isLoading: false,
  error: null,

  // Actions
  loadModels: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getModels();
      const payload = response as unknown;

      // El apiService devuelve directamente la respuesta del servidor
      // El backend puede devolver directamente un array o un objeto con "models"
      let modelsArray: RawModel[] = [];

      // El backend devuelve directamente un array según el usuario
      if (Array.isArray(payload)) {
        modelsArray = payload as RawModel[];
      } else if (
        typeof payload === "object" &&
        payload !== null &&
        "models" in payload &&
        Array.isArray((payload as { models: unknown }).models)
      ) {
        modelsArray = (payload as { models: RawModel[] }).models;
      } else if (
        typeof payload === "object" &&
        payload !== null &&
        "data" in payload &&
        Array.isArray((payload as { data: unknown }).data)
      ) {
        modelsArray = (payload as { data: RawModel[] }).data;
      } else if (payload && typeof payload === "object") {
        // Intentar extraer modelos de cualquier propiedad del objeto
        const keys = Object.keys(payload);
        for (const key of keys) {
          const candidate = (payload as Record<string, unknown>)[key];
          if (Array.isArray(candidate)) {
            modelsArray = candidate as RawModel[];
            break;
          }
        }
      }

      if (modelsArray.length > 0) {
        // Normalizar modelos del backend
        const normalizedModels = modelsArray.map(normalizeModel);

        set({
          models: normalizedModels,
          isLoading: false,
          error: null,
        });

        const currentState = useModelStore.getState();
        const currentModel = currentState.selectedModel
          ? normalizedModels.find((model) => model.id === currentState.selectedModel?.id)
          : null;
        const defaultModel =
          normalizedModels.find(
            (model: AIModel) =>
              (model.available || model.isAvailable) && !model.isPremium,
          ) ||
          normalizedModels.find(
            (model: AIModel) => model.available || model.isAvailable,
          ) ||
          normalizedModels[0];

        if ((!currentModel || !(currentModel.available || currentModel.isAvailable)) && defaultModel) {
          currentState.selectModel(defaultModel);
        }
      } else {
        set({
          isLoading: false,
          error: "Error al cargar modelos: respuesta inválida",
        });
      }
    } catch (error: unknown) {
      console.error("❌ Error cargando modelos desde API:", error);
      set({
        models: [],
        isLoading: false,
        error: "No se pudieron cargar los modelos desde el backend",
      });
    }
  },

  selectModel: (model: AIModel) => {
    set({ selectedModel: model });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
