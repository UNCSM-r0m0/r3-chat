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
            const response = await fetch('https://jeanett-uncolorable-pickily.ngrok-free.dev/api/chat/usage/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth-token') ? JSON.parse(localStorage.getItem('auth-token')!).token : ''}`,
                    'ngrok-skip-browser-warning': 'true',
                },
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
