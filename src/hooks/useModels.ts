import { useEffect, useCallback } from 'react';
import { useModelStore } from '../stores/modelStore';
import { STORAGE_KEYS } from '../constants';

export const useModels = () => {
    const {
        models,
        selectedModel,
        isLoading,
        error,
        loadModels,
        selectModel,
        clearError,
    } = useModelStore();

    // Cargar modelos al montar el componente
    useEffect(() => {
        loadModels();
    }, [loadModels]);

    // Cargar modelo seleccionado del localStorage o establecer uno por defecto
    useEffect(() => {
        const storedModel = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
        if (storedModel && !selectedModel) {
            try {
                const modelData = JSON.parse(storedModel);
                selectModel(modelData);
            } catch (error) {
                console.error('Error parsing stored model data:', error);
            }
        } else if (!storedModel && !selectedModel && models.length > 0) {
            // Si no hay modelo guardado y hay modelos disponibles, seleccionar DeepSeek R1 por defecto
            const defaultModel = models.find(model =>
                model.isAvailable &&
                !model.isPremium &&
                model.id === 'deepseek-r1:7b'
            ) || models.find(model => model.isAvailable && !model.isPremium) || models[0];

            if (defaultModel) {
                selectModel(defaultModel);
            }
        }
    }, [selectedModel, selectModel, models]);

    // Función para seleccionar modelo
    const handleSelectModel = useCallback((model: any) => {
        selectModel(model);
    }, [selectModel]);

    // Función para obtener modelo por ID
    const getModelById = useCallback((modelId: string) => {
        return models.find(model => model.id === modelId);
    }, [models]);

    // Función para obtener modelos disponibles
    const getAvailableModels = useCallback(() => {
        return models.filter(model => model.isAvailable);
    }, [models]);

    // Función para obtener modelos premium
    const getPremiumModels = useCallback(() => {
        return models.filter(model => model.isPremium);
    }, [models]);

    // Función para buscar modelos
    const searchModels = useCallback((query: string) => {
        const lowercaseQuery = query.toLowerCase();
        return models.filter(model =>
            model.name.toLowerCase().includes(lowercaseQuery) ||
            model.description.toLowerCase().includes(lowercaseQuery) ||
            model.provider.toLowerCase().includes(lowercaseQuery)
        );
    }, [models]);

    return {
        models,
        selectedModel,
        isLoading,
        error,
        selectModel: handleSelectModel,
        getModelById,
        getAvailableModels,
        getPremiumModels,
        searchModels,
        clearError,
    };
};
