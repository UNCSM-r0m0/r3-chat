import { useCallback, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import type { SubscriptionInfo } from '../stores/subscriptionStore';

const isSubscriptionInfo = (value: unknown): value is SubscriptionInfo => {
    if (typeof value !== 'object' || value === null) return false;
    return 'tier' in value;
};

const normalizeSubscription = (response: unknown): SubscriptionInfo | null => {
    const payload =
        typeof response === 'object' && response !== null && 'data' in response
            ? (response as { data?: unknown }).data
            : response;

    if (isSubscriptionInfo(payload)) return payload;

    if (typeof payload === 'object' && payload !== null) {
        const plan = (payload as { plan?: { slug?: unknown } }).plan;
        const subscription = (payload as { subscription?: { status?: unknown } }).subscription;
        const slug = typeof plan?.slug === 'string' ? plan.slug.toLowerCase() : 'registered';
        const status = typeof subscription?.status === 'string' ? subscription.status.toLowerCase() : '';
        const isPremium = slug === 'premium' && (!status || status === 'active');
        return { tier: isPremium ? 'PREMIUM' : 'REGISTERED', plan, subscription };
    }

    return { tier: 'REGISTERED' };
};

export const useSubscription = () => {
    const { subscription, isLoading, setSubscription, setLoading } = useSubscriptionStore();
    const { isAuthenticated } = useAuth();

    const loadSubscription = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const response = await apiService.getSubscription();

            setSubscription(normalizeSubscription(response));
        } catch (error) {
            console.warn('❌ Error cargando suscripción:', error);
            setSubscription({ tier: 'REGISTERED' });
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, setLoading, setSubscription]);

    // Cargar suscripción cuando el usuario se autentica
    useEffect(() => {
        if (isAuthenticated) {
            loadSubscription();
        } else {
            setSubscription(null);
        }
    }, [isAuthenticated, loadSubscription, setSubscription]);

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


