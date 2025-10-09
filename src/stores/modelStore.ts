import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';
import { AI_MODELS, STORAGE_KEYS } from '../constants';
import type { ModelState, AIModel } from '../types';

interface ModelStore extends ModelState {
    // Actions
    loadModels: () => Promise<void>;
    selectModel: (model: AIModel) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useModelStore = create<ModelStore>()(
    persist(
        (set) => ({
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

                    if (response.success) {
                        const newModels = response.data;
                        set({
                            models: newModels,
                            isLoading: false,
                            error: null
                        });

                        // Si no hay modelo seleccionado, seleccionar el primero disponible
                        const currentState = useModelStore.getState();
                        if (!currentState.selectedModel && newModels.length > 0) {
                            const defaultModel = newModels.find((model: AIModel) => model.isAvailable) || newModels[0];
                            if (defaultModel) {
                                currentState.selectModel(defaultModel);
                            }
                        }
                    } else {
                        set({
                            isLoading: false,
                            error: response.message || 'Error al cargar modelos'
                        });
                    }
                } catch (error: any) {
                    // Si falla la API, usar los modelos por defecto
                    const fallbackModels = [...AI_MODELS] as AIModel[];
                    set({
                        models: fallbackModels,
                        isLoading: false,
                        error: null
                    });

                    // Si no hay modelo seleccionado, seleccionar el primero disponible
                    const currentState = useModelStore.getState();
                    if (!currentState.selectedModel && fallbackModels.length > 0) {
                        const defaultModel = fallbackModels.find(model => model.isAvailable) || fallbackModels[0];
                        if (defaultModel) {
                            currentState.selectModel(defaultModel);
                        }
                    }
                }
            },

            selectModel: (model: AIModel) => {
                set({ selectedModel: model });
                localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, JSON.stringify(model));
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
        }),
        {
            name: 'model-storage',
            partialize: (state) => ({
                models: state.models,
                selectedModel: state.selectedModel,
            }),
        }
    )
);
