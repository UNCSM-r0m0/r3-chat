import { create } from 'zustand';
import { apiService } from '../services/api';
import type { UploadedFile } from '../types';

interface FileState {
    files: UploadedFile[];
    isUploading: boolean;
    error: string | null;
    uploadFile: (file: File) => Promise<UploadedFile | null>;
    removeFile: (id: string) => void;
    clearFiles: () => void;
    setError: (error: string | null) => void;
}

export const useFileStore = create<FileState>()((set) => ({
    files: [],
    isUploading: false,
    error: null,

    uploadFile: async (file: File) => {
        set({ isUploading: true, error: null });
        try {
            const response = await apiService.uploadFile(file);
            if (response.success && response.data) {
                const uploaded = response.data;
                set((state) => ({
                    files: [...state.files, uploaded],
                    isUploading: false,
                }));
                return uploaded;
            } else {
                set({ isUploading: false, error: response.message || 'Error al subir archivo' });
                return null;
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al subir archivo';
            set({ isUploading: false, error: message });
            return null;
        }
    },

    removeFile: (id: string) => {
        set((state) => ({
            files: state.files.filter((f) => f.id !== id),
        }));
    },

    clearFiles: () => {
        set({ files: [], error: null });
    },

    setError: (error: string | null) => {
        set({ error });
    },
}));
