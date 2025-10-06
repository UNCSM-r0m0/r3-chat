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
                        set({
                            models: response.data,
                            isLoading: false,
                            error: null
                        });
                    } else {
                        set({
                            isLoading: false,
                            error: response.message || 'Error al cargar modelos'
                        });
                    }
                } catch (error: any) {
                    // Si falla la API, usar los modelos por defecto
                    set({
                        models: [...AI_MODELS] as AIModel[],
                        isLoading: false,
                        error: null
                    });
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
