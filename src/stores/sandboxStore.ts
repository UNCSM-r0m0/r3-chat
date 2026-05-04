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

interface SandboxPreview {
    id: string;
    conversationId: string;
    code: string;
    language: string;
    createdAt: number;
}

interface SandboxState {
    results: Record<string, SandboxExecution[]>;
    previews: Record<string, SandboxPreview[]>;
    isExecuting: boolean;
    error: string | null;
    execute: (conversationId: string, code: string, language: string) => Promise<void>;
    preview: (conversationId: string, code: string, language: string) => void;
    clearExecutions: (conversationId: string) => void;
    setError: (error: string | null) => void;
    loadArtifact: (artifactId: string, conversationId: string) => Promise<void>;
}

export const useSandboxStore = create<SandboxState>()((set) => ({
    results: {},
    previews: {},
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

    preview: (conversationId: string, code: string, language: string) => {
        const preview: SandboxPreview = {
            id: `${conversationId}-preview-${Date.now()}`,
            conversationId,
            code,
            language,
            createdAt: Date.now(),
        };

        set((state) => {
            const existing = state.previews[conversationId] || [];
            return {
                previews: {
                    ...state.previews,
                    [conversationId]: [...existing, preview],
                },
            };
        });
    },

    clearExecutions: (conversationId: string) => {
        set((state) => {
            const nextResults = { ...state.results };
            const nextPreviews = { ...state.previews };
            delete nextResults[conversationId];
            delete nextPreviews[conversationId];
            return { results: nextResults, previews: nextPreviews };
        });
    },

    setError: (error: string | null) => {
        set({ error });
    },

    loadArtifact: async (artifactId: string, conversationId: string) => {
        try {
            const response = await apiService.getArtifact(artifactId);
            if (response.success && response.data) {
                const preview: SandboxPreview = {
                    id: `${conversationId}-artifact-${artifactId}`,
                    conversationId,
                    code: response.data.content || '',
                    language: response.data.type === 'website' ? 'html' : 'text',
                    createdAt: Date.now(),
                };
                set((state) => {
                    const existing = state.previews[conversationId] || [];
                    return {
                        previews: {
                            ...state.previews,
                            [conversationId]: [...existing, preview],
                        },
                    };
                });
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error cargando artifact';
            set({ error: message });
        }
    },
}));
