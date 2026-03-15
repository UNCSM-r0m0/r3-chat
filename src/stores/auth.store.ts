import { create } from 'zustand';
import { apiService } from '../services/api';

type ApiErrorLike = {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
};

const toApiError = (error: unknown): ApiErrorLike => {
    if (typeof error === 'object' && error !== null) {
        return error as ApiErrorLike;
    }
    return {};
};

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    plan?: 'free' | 'pro' | 'premium';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthStore extends AuthState {
    // Actions
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (token: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    clearError: () => void;
    setUser: (user: User | null) => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
    // Estado inicial
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Actions
    setUser: (user) => {
        set({ user, isAuthenticated: !!user });
    },

    clearError: () => {
        set({ error: null });
    },

    login: async (email: string, password: string) => {
        try {
            set({ isLoading: true, error: null });

            const response = await apiService.login({ email, password });

            if (response.success) {
                const { user } = response.data;

                // Las cookies HTTP-only se manejan automáticamente por el servidor
                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            } else {
                set({
                    isLoading: false,
                    error: response.message || 'Error en el login',
                });
                throw new Error(response.message || 'Error en el login');
            }
        } catch (error: unknown) {
            const apiError = toApiError(error);
            set({
                isLoading: false,
                error: apiError.response?.data?.message || apiError.message || 'Error en el login',
            });
            throw error;
        }
    },

    loginWithGoogle: async (token: string) => {
        try {
            set({ isLoading: true, error: null });
            // Se mantiene por compatibilidad de firma, pero auth real es por cookie HTTP-only.
            void token;

            // Obtener perfil del usuario (las cookies HTTP-only se manejan automáticamente)
            const profileResponse = await apiService.getProfile();

            if (profileResponse) {
                const user = profileResponse;

                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            } else {
                throw new Error('Error al obtener perfil del usuario');
            }
        } catch (error: unknown) {
            const apiError = toApiError(error);
            set({
                isLoading: false,
                error: apiError.response?.data?.message || apiError.message || 'Error en el login con Google',
            });
            throw error;
        }
    },

    register: async (name: string, email: string, password: string) => {
        try {
            set({ isLoading: true, error: null });

            const response = await apiService.register({ name, email, password });

            if (response.success) {
                const { user } = response.data;

                // Las cookies HTTP-only se manejan automáticamente por el servidor
                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            } else {
                set({
                    isLoading: false,
                    error: response.message || 'Error en el registro',
                });
                throw new Error(response.message || 'Error en el registro');
            }
        } catch (error: unknown) {
            const apiError = toApiError(error);
            set({
                isLoading: false,
                error: apiError.response?.data?.message || apiError.message || 'Error en el registro',
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true });

            // Limpiar cookies del servidor
            await apiService.logout();

            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch {
            // Aún así limpiar el estado local
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },

    refreshToken: async () => {
        try {
            set({ isLoading: true, error: null });

            // Verificar autenticación con el servidor usando cookies HTTP-only
            try {
                const response = await apiService.getProfile();
                if (response) {
                    set({
                        user: response,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    return;
                }
            } catch {
                // Si falla la verificación del servidor, limpiar estado
                void 0;
            }

            // No hay sesión válida
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            const apiError = toApiError(error);
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: apiError.message || 'Error al renovar el token',
            });
            throw error;
        }
    },

    checkAuth: async () => {
        try {
            set({ isLoading: true });

            // Verificar autenticación con el servidor usando cookies HTTP-only
            try {
                const response = await apiService.getProfile();
                if (response) {
                    set({
                        user: response,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    return;
                }
            } catch {
                // Si falla la verificación del servidor, no hay sesión válida
                void 0;
            }

            // No hay sesión válida
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    }
}));
