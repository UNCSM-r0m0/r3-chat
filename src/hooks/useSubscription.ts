import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';

export const useSubscription = () => {
    const [subscription, setSubscription] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    const loadSubscription = async () => {
        if (!isAuthenticated) return;

        try {
            setIsLoading(true);
            const response = await apiService.getSubscription();

            // El API devuelve los datos directamente, no en un objeto {success, data}
            if (response && (response as any).tier) {
                setSubscription(response);
            } else {
                setSubscription(null);
            }
        } catch (error) {
            console.warn('❌ Error cargando suscripción:', error);
            setSubscription(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar suscripción cuando el usuario se autentica
    useEffect(() => {
        if (isAuthenticated) {
            loadSubscription();
        } else {
            setSubscription(null);
        }
    }, [isAuthenticated]);

    // Recargar suscripción cada 30 segundos mientras esté autenticado
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            loadSubscription();
        }, 30000);

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const getTierDisplay = () => {
        if (!subscription) {
            return 'Free';
        }

        switch (subscription.tier) {
            case 'PREMIUM':
                return 'Pro';
            case 'REGISTERED':
                return 'Registered';
            default:
                return 'Free';
        }
    };

    const getTierColor = () => {
        if (!subscription) return 'text-gray-500';

        switch (subscription.tier) {
            case 'PREMIUM':
                return 'text-purple-600 dark:text-purple-400';
            case 'REGISTERED':
                return 'text-blue-600 dark:text-blue-400';
            default:
                return 'text-gray-500 dark:text-gray-400';
        }
    };

    const canUsePremium = subscription?.tier === 'PREMIUM';

    return {
        subscription,
        isLoading,
        loadSubscription,
        getTierDisplay,
        getTierColor,
        canUsePremium
    };
};
