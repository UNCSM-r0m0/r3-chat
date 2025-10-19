import { useEffect, useCallback } from 'react';
import { useModelStore } from '../stores/modelStore';
import { useSubscription } from './useSubscription';

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

    const { subscription } = useSubscription();

    // Cargar modelos al montar el componente
    useEffect(() => {
        loadModels();
    }, [loadModels]);

    // Recargar modelos cuando cambie la suscripción
    useEffect(() => {
        if (subscription) {
            loadModels();
        }
    }, [subscription?.tier, loadModels]);

    // Establecer modelo por defecto si no hay uno seleccionado
    useEffect(() => {
        if (!selectedModel && models.length > 0) {
            // Seleccionar DeepSeek R1 por defecto
            const defaultModel = models.find(model =>
                (model.available || model.isAvailable) &&
                !model.isPremium &&
                model.id === 'deepseek-r1:7b'
            ) || models.find(model => (model.available || model.isAvailable) && !model.isPremium) || models[0];

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
