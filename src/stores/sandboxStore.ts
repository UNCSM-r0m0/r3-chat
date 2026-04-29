import { create } from 'zustand';
import { apiService } from '../services/api';

interface SandboxExecution {
    id: string;
    conversationId: string;
    code: string;
    language: string;
    output: string;
    error?: string;
    executedAt: number;
}

interface SandboxState {
    results: Record<string, SandboxExecution[]>;
    isExecuting: boolean;
    error: string | null;
    execute: (conversationId: string, code: string, language: string) => Promise<void>;
    clearExecutions: (conversationId: string) => void;
    setError: (error: string | null) => void;
}

export const useSandboxStore = create<SandboxState>()((set) => ({
    results: {},
    isExecuting: false,
    error: null,

    execute: async (conversationId: string, code: string, language: string) => {
        set({ isExecuting: true, error: null });
        try {
            const response = await apiService.executeSandbox(code, language);
            if (response.success && response.data) {
                const result: SandboxExecution = {
                    id: `${conversationId}-${Date.now()}`,
                    conversationId,
                    code,
                    language,
                    output: response.data.output || '',
                    error: response.data.error,
                    executedAt: Date.now(),
                };
                set((state) => {
                    const existing = state.results[conversationId] || [];
                    return {
                        results: {
                            ...state.results,
                            [conversationId]: [...existing, result],
                        },
                        isExecuting: false,
                    };
                });
            } else {
                set({ isExecuting: false, error: response.message || 'Error en sandbox' });
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error en sandbox';
            set({ isExecuting: false, error: message });
        }
    },

    clearExecutions: (conversationId: string) => {
        set((state) => {
            const next = { ...state.results };
            delete next[conversationId];
            return { results: next };
        });
    },

    setError: (error: string | null) => {
        set({ error });
    },
}));
