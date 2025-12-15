import { create } from 'zustand';
import { apiService } from '../services/api';
import { AI_MODELS } from '../constants';
import type { ModelState, AIModel } from '../types';

// Función para normalizar modelos del backend
const normalizeModel = (model: any): AIModel => {
    return {
        id: model.id,
        name: model.name,
        provider: model.provider as AIModel['provider'],
        description: model.description || '',
        maxTokens: model.maxTokens,
        supportsImages: model.features?.includes('multimodal') || model.supportsImages || false,
        supportsReasoning: model.features?.includes('advanced') || model.supportsReasoning || false,
        isPremium: model.premium !== undefined ? model.premium : (model.isPremium || false),
        isAvailable: model.available !== undefined ? model.available : (model.isAvailable || false),
        available: model.available !== undefined ? model.available : (model.isAvailable || false),
        features: model.features || [],
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

            // El apiService devuelve directamente la respuesta del servidor
            // El backend puede devolver directamente un array o un objeto con "models"
            let modelsArray: any[] = [];

            // El backend devuelve directamente un array según el usuario
            if (Array.isArray(response)) {
                modelsArray = response;
            } else if (response && (response as any).models && Array.isArray((response as any).models)) {
                modelsArray = (response as any).models;
            } else if (response && (response as any).data && Array.isArray((response as any).data)) {
                modelsArray = (response as any).data;
            } else if (response && typeof response === 'object') {
                // Intentar extraer modelos de cualquier propiedad del objeto
                const keys = Object.keys(response);
                for (const key of keys) {
                    if (Array.isArray((response as any)[key])) {
                        modelsArray = (response as any)[key];
                        break;
                    }
                }
            }

            if (modelsArray.length > 0) {
                // Normalizar modelos del backend
                const normalizedModels = modelsArray.map(normalizeModel);

                // Log para debugging
                console.log('📦 Modelos cargados desde el backend:', normalizedModels.length);
                console.log('📋 Lista de modelos:', normalizedModels.map((m: AIModel) => ({
                    id: m.id,
                    name: m.name,
                    provider: m.provider,
                    isPremium: m.isPremium,
                    isAvailable: m.isAvailable || m.available
                })));

                set({
                    models: normalizedModels,
                    isLoading: false,
                    error: null
                });

                // Si no hay modelo seleccionado, seleccionar el primer modelo disponible no premium
                const currentState = useModelStore.getState();
                if (!currentState.selectedModel && normalizedModels.length > 0) {
                    const defaultModel =
                        normalizedModels.find((model: AIModel) => (model.available || model.isAvailable) && !model.isPremium) ||
                        normalizedModels.find((model: AIModel) => (model.available || model.isAvailable)) ||
                        normalizedModels[0];

                    if (defaultModel) {
                        currentState.selectModel(defaultModel);
                    }
                }
            } else {
                set({
                    isLoading: false,
                    error: 'Error al cargar modelos: respuesta inválida'
                });
            }
        } catch (error: any) {
            console.error('❌ Error cargando modelos desde API:', error);
            console.warn('⚠️ Usando modelos fallback (hardcoded)');
            // Si falla la API, usar los modelos por defecto
            const fallbackModels = [...AI_MODELS] as AIModel[];
            set({
                models: fallbackModels,
                isLoading: false,
                error: null
            });

            // Si no hay modelo seleccionado, seleccionar el primer modelo disponible no premium
            const currentState = useModelStore.getState();
            if (!currentState.selectedModel && fallbackModels.length > 0) {
                const defaultModel =
                    fallbackModels.find(model => (model.available || (model as any).isAvailable) && !model.isPremium) ||
                    fallbackModels.find(model => (model.available || (model as any).isAvailable)) ||
                    fallbackModels[0];

                if (defaultModel) {
                    currentState.selectModel(defaultModel);
                }
            }
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
