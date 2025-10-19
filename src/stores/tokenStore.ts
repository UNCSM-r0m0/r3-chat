/**
 * Store para manejar estado de autenticación en memoria
 * NO usa localStorage - solo cookies HTTP-only del servidor
 */

import { create } from 'zustand';

interface TokenState {
    isAuthenticated: boolean;
}

interface TokenStore extends TokenState {
    // Actions
    setAuthenticated: (authenticated: boolean) => void;
    clearAuth: () => void;
}

export const useTokenStore = create<TokenStore>()((set) => ({
    // Estado inicial
    isAuthenticated: false,

    // Actions
    setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated });
    },

    clearAuth: () => {
        set({ isAuthenticated: false });
    },
}));
