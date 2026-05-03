import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

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
            const response = await fetch(`${API_BASE_URL}/usage/stats`, {
                credentials: 'include', // Incluir cookies HTTP-only
            });

            if (response.ok) {
                const payload = await response.json();
                const stats = payload?.data ?? payload;
                const rawStats = stats?.stats ?? stats;
                setUsageStats({
                    todayMessages: Number(rawStats.todayMessages ?? rawStats.total_requests ?? 0),
                    todayTokens: Number(rawStats.todayTokens ?? ((rawStats.tokens_input ?? 0) + (rawStats.tokens_output ?? 0))),
                    totalMessages: Number(rawStats.totalMessages ?? rawStats.total_requests ?? 0),
                    totalTokens: Number(rawStats.totalTokens ?? ((rawStats.tokens_input ?? 0) + (rawStats.tokens_output ?? 0))),
                    tier: String(rawStats.tier ?? 'registered'),
                    limits: {
                        messagesPerDay: Number(rawStats.limits?.messagesPerDay ?? 50),
                        maxTokensPerMessage: Number(rawStats.limits?.maxTokensPerMessage ?? 4096),
                        canUploadImages: Boolean(rawStats.limits?.canUploadImages ?? false),
                    },
                });
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
