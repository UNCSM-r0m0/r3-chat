/**
 * Store para manejar tokens de autenticación en memoria
 * NO usa localStorage por seguridad - solo memoria del navegador
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface TokenState {
    accessToken: string | null;
    isAuthenticated: boolean;
}

interface TokenStore extends TokenState {
    // Actions
    setToken: (token: string | null) => void;
    clearToken: () => void;
    getToken: () => string | null;
}

export const useTokenStore = create<TokenStore>()(
    subscribeWithSelector((set, get) => ({
        // Estado inicial
        accessToken: null,
        isAuthenticated: false,

        // Actions
        setToken: (token: string | null) => {
            set({
                accessToken: token,
                isAuthenticated: !!token,
            });
        },

        clearToken: () => {
            set({
                accessToken: null,
                isAuthenticated: false,
            });
        },

        getToken: () => {
            return get().accessToken;
        },
    }))
);

// Suscripción para limpiar token al cerrar la ventana/pestaña
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        useTokenStore.getState().clearToken();
    });

    // También limpiar al perder el foco (opcional)
    window.addEventListener('blur', () => {
        // Opcional: limpiar token al perder foco para mayor seguridad
        // useTokenStore.getState().clearToken();
    });
}
