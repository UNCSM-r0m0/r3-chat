import { useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';
import { socketService } from '../services/socketService';
import { useSubscriptionStore } from '../stores/subscriptionStore';

export const useSubscription = () => {
    const { subscription, isLoading, setSubscription, setLoading } = useSubscriptionStore();
    const { isAuthenticated } = useAuth();

    const loadSubscription = async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
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
            setLoading(false);
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

    // WS push: escuchar cambios de suscripción y evitar polling agresivo duplicado
    useEffect(() => {
        if (!isAuthenticated) return;
        socketService.connect();
        const handler = (data: any) => setSubscription(data);
        socketService.onSubscriptionUpdated(handler);
        return () => socketService.offSubscriptionUpdated(handler);
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


