import { useState, useEffect } from 'react';

interface UsageStats {
    todayMessages: number;
    todayTokens: number;
    totalMessages: number;
    totalTokens: number;
    tier: string;
    limits: {
        messagesPerDay: number;
        maxTokensPerMessage: number;
        canUploadImages: boolean;
    };
}

export const useUsageStats = () => {
    const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadUsageStats = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://api.r0lm0.dev/api/chat/usage/stats', {
                credentials: 'include', // Incluir cookies HTTP-only
            });

            if (response.ok) {
                const stats = await response.json();
                setUsageStats(stats);
            } else {
                console.warn('Error cargando estadísticas de uso:', response.status);
                setUsageStats(null);
            }
        } catch (error) {
            console.warn('Error cargando estadísticas de uso:', error);
            setUsageStats(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsageStats();
    }, []);

    return {
        usageStats,
        isLoading,
        loadUsageStats
    };
};
