import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiService } from '../services/api';
import { secureStorageManager, useSecureStorage } from '../utils/secureStorage';
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

                        // Si no hay modelo seleccionado, seleccionar DeepSeek R1 por defecto
                        const currentState = useModelStore.getState();
                        if (!currentState.selectedModel && newModels.length > 0) {
                            const defaultModel = newModels.find((model: AIModel) =>
                                model.isAvailable &&
                                !model.isPremium &&
                                model.id === 'deepseek-r1:7b'
                            ) || newModels.find((model: AIModel) => model.isAvailable && !model.isPremium) || newModels[0];

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

                    // Si no hay modelo seleccionado, seleccionar DeepSeek R1 por defecto
                    const currentState = useModelStore.getState();
                    if (!currentState.selectedModel && fallbackModels.length > 0) {
                        const defaultModel = fallbackModels.find(model =>
                            model.isAvailable &&
                            !model.isPremium &&
                            model.id === 'deepseek-r1:7b'
                        ) || fallbackModels.find(model => model.isAvailable && !model.isPremium) || fallbackModels[0];

                        if (defaultModel) {
                            currentState.selectModel(defaultModel);
                        }
                    }
                }
            },

            selectModel: (model: AIModel) => {
                set({ selectedModel: model });
                // El storage cifrado se encarga de persistir automáticamente
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
            storage: createJSONStorage(() => {
                // Usar storage cifrado solo si hay passphrase configurada
                const { getLocalStorageWrapper } = useSecureStorage();
                return secureStorageManager.hasPassphrase()
                    ? secureStorageManager.getStorage()
                    : getLocalStorageWrapper();
            }),
            partialize: (state) => ({
                models: state.models,
                selectedModel: state.selectedModel,
            }),
        }
    )
);
