import { create } from 'zustand';
import { apiService } from '../services/api';

export interface ArtifactFile {
    path: string;
    language?: string;
    content: string;
}

export interface ArtifactProject {
    id: string;
    conversation_id: string;
    type: string;
    entry_file: string;
    version: number;
    files: ArtifactFile[];
    created_at: string;
    updated_at: string;
}

interface ArtifactState {
    currentArtifact: ArtifactProject | null;
    selectedFilePath: string | null;
    requestedArtifactId: string | null;
    isLoading: boolean;
    error: string | null;
    loadArtifact: (id: string) => Promise<void>;
    selectFile: (path: string) => void;
    clearArtifact: () => void;
}

export const useArtifactStore = create<ArtifactState>()((set, get) => ({
    currentArtifact: null,
    selectedFilePath: null,
    requestedArtifactId: null,
    isLoading: false,
    error: null,

    loadArtifact: async (id: string) => {
        set((state) => ({
            requestedArtifactId: id,
            isLoading: true,
            error: null,
            currentArtifact: state.currentArtifact?.id === id ? state.currentArtifact : null,
            selectedFilePath: state.currentArtifact?.id === id ? state.selectedFilePath : null,
        }));
        try {
            const response = await apiService.getArtifact(id);
            if (get().requestedArtifactId !== id) return;

            if (response.success && response.data) {
                const project = response.data as ArtifactProject;
                set({
                    currentArtifact: project,
                    selectedFilePath: project.entry_file || (project.files[0]?.path ?? null),
                    requestedArtifactId: null,
                    isLoading: false,
                });
            } else {
                set({
                    requestedArtifactId: null,
                    isLoading: false,
                    error: response.message || 'Error cargando artifact',
                });
            }
        } catch (err: unknown) {
            if (get().requestedArtifactId !== id) return;

            const message = err instanceof Error ? err.message : 'Error cargando artifact';
            set({ requestedArtifactId: null, isLoading: false, error: message });
        }
    },

    selectFile: (path: string) => {
        set({ selectedFilePath: path });
    },

    clearArtifact: () => {
        set({
            currentArtifact: null,
            selectedFilePath: null,
            requestedArtifactId: null,
            isLoading: false,
            error: null,
        });
    },
}));
