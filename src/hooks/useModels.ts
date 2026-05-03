import { useEffect, useCallback, useMemo } from 'react';
import { useModelStore } from '../stores/modelStore';
import { useSubscription } from './useSubscription';
import type { AIModel } from '../types';

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

    const { subscription, canUsePremium } = useSubscription();

    // Cargar modelos al montar el componente
    useEffect(() => {
        loadModels();
    }, [loadModels]);

    // Recargar modelos cuando cambie la suscripción
    useEffect(() => {
        if (subscription?.tier) {
            loadModels();
        }
    }, [subscription?.tier, loadModels]);

    const hasNativeRegisteredModel = useMemo(
        () => models.some((model) => Boolean(model.available ?? model.isAvailable) && !model.isPremium),
        [models]
    );

    const isTemporaryRegisteredFallback = useCallback((model: AIModel) => {
        const fingerprint = `${model.id} ${model.name} ${model.provider}`.toLowerCase();
        return !hasNativeRegisteredModel && (fingerprint.includes('ollama') || fingerprint.includes('qwen'));
    }, [hasNativeRegisteredModel]);

    // Si cambia el tier, no dejes al usuario Registered parado en un modelo Pro.
    useEffect(() => {
        if (!models.length) return;
        const isUsable = (model: AIModel | null) => {
            if (!model) return false;
            const isAvailable = Boolean(model.available ?? model.isAvailable);
            const tierAllows = !model.isPremium || canUsePremium || isTemporaryRegisteredFallback(model);
            return isAvailable && tierAllows;
        };

        if (isUsable(selectedModel)) return;

        const fallback = models.find((model) => {
            const isAvailable = Boolean(model.available ?? model.isAvailable);
            return isAvailable && (!model.isPremium || canUsePremium || isTemporaryRegisteredFallback(model));
        });

        if (fallback) selectModel(fallback);
    }, [models, selectedModel, canUsePremium, isTemporaryRegisteredFallback, selectModel]);

    // Función para seleccionar modelo
    const handleSelectModel = useCallback((model: AIModel) => {
        selectModel(model);
    }, [selectModel]);

    // Función para obtener modelo por ID
    const getModelById = useCallback((modelId: string) => {
        return models.find(model => model.id === modelId);
    }, [models]);

    // Función para obtener modelos disponibles según el tier del usuario
    const getAvailableModels = useCallback(() => {
        // Si es premium, mostrar todos los modelos disponibles
        if (canUsePremium) {
            return models.filter(model => model.isAvailable || model.available);
        }
        // Si no es premium, solo modelos no premium
        return models.filter(model =>
            (model.isAvailable || model.available) && (!model.isPremium || isTemporaryRegisteredFallback(model))
        );
    }, [models, canUsePremium, isTemporaryRegisteredFallback]);

    // Modelos filtrados según suscripción
    const filteredModels = useMemo(() => {
        return getAvailableModels();
    }, [getAvailableModels]);

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
        models: filteredModels, // Devolver modelos filtrados
        allModels: models, // Todos los modelos (sin filtrar)
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
