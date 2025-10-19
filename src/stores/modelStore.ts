import { create } from 'zustand';
import { apiService } from '../services/api';
import { AI_MODELS } from '../constants';
import type { ModelState, AIModel } from '../types';

interface ModelStore extends ModelState {
    // Actions
    loadModels: () => Promise<void>;
    selectModel: (model: AIModel) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useModelStore = create<ModelStore>()((set) => ({
    // Estado inicial
    models: [...AI_MODELS] as AIModel[],
    selectedModel: null,
    isLoading: false,
    error: null,

    // Actions
    loadModels: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await apiService.getModels();

            // El apiService devuelve directamente la respuesta del servidor
            if (response && (response as any).models) {
                const newModels = (response as any).models;
                set({
                    models: newModels,
                    isLoading: false,
                    error: null
                });

                // Si no hay modelo seleccionado, seleccionar el primer modelo disponible no premium
                const currentState = useModelStore.getState();
                if (!currentState.selectedModel && newModels.length > 0) {
                    const defaultModel =
                        newModels.find((model: AIModel) => (model.available || (model as any).isAvailable) && !model.isPremium) ||
                        newModels.find((model: AIModel) => (model.available || (model as any).isAvailable)) ||
                        newModels[0];

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
            console.warn('Error cargando modelos desde API, usando fallback:', error);
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
