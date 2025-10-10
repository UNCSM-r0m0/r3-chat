import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';

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

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
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
                        const { user, token } = response.data;

                        // Guardar token con expiración de 7 días
                        const tokenData = {
                            token,
                            expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
                        };
                        localStorage.setItem('auth-token', JSON.stringify(tokenData));
                        localStorage.setItem('user', JSON.stringify(user));

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
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Error en el login',
                    });
                    throw error;
                }
            },

            loginWithGoogle: async (token: string) => {
                try {
                    set({ isLoading: true, error: null });

                    // Guardar token con expiración de 7 días
                    const tokenData = {
                        token,
                        expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
                    };
                    localStorage.setItem('auth-token', JSON.stringify(tokenData));

                    // Obtener perfil del usuario
                    const profileResponse = await apiService.getProfile();

                    if (profileResponse) {
                        const user = profileResponse;
                        localStorage.setItem('user', JSON.stringify(user));

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });
                    } else {
                        throw new Error('Error al obtener perfil del usuario');
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Error en el login con Google',
                    });
                    throw error;
                }
            },

            register: async (name: string, email: string, password: string) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await apiService.register({ name, email, password });

                    if (response.success) {
                        const { user, token } = response.data;

                        // Guardar token con expiración de 7 días
                        const tokenData = {
                            token,
                            expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
                        };
                        localStorage.setItem('auth-token', JSON.stringify(tokenData));
                        localStorage.setItem('user', JSON.stringify(user));

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
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || error.message || 'Error en el registro',
                    });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    set({ isLoading: true });

                    // Limpiar tokens del servidor
                    await apiService.logout();

                    // Limpiar tokens locales
                    localStorage.removeItem('auth-token');
                    localStorage.removeItem('user');

                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    // Aún así limpiar el estado local
                    localStorage.removeItem('auth-token');
                    localStorage.removeItem('user');

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

                    // Verificar si el token actual es válido
                    const tokenData = localStorage.getItem('auth-token');
                    if (tokenData) {
                        const parsed = JSON.parse(tokenData);
                        if (parsed.expires && parsed.expires > Date.now()) {
                            // Token aún válido, solo actualizar estado
                            const userData = localStorage.getItem('user');
                            if (userData) {
                                const user = JSON.parse(userData);
                                set({
                                    user,
                                    isAuthenticated: true,
                                    isLoading: false,
                                    error: null,
                                });
                                return;
                            }
                        }
                    }

                    // Token expirado o no existe, limpiar sesión
                    localStorage.removeItem('auth-token');
                    localStorage.removeItem('user');

                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    // Si falla el refresh, limpiar todo
                    localStorage.removeItem('auth-token');
                    localStorage.removeItem('user');

                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.message || 'Error al renovar el token',
                    });
                    throw error;
                }
            },

            checkAuth: async () => {
                try {
                    set({ isLoading: true });

                    // Verificar token en localStorage
                    const tokenData = localStorage.getItem('auth-token');
                    const userData = localStorage.getItem('user');

                    if (tokenData && userData) {
                        const parsed = JSON.parse(tokenData);

                        // Verificar si el token no ha expirado
                        if (parsed.expires && parsed.expires > Date.now()) {
                            // Token válido, verificar con el servidor
                            try {
                                const response = await apiService.getProfile();
                                if (response) {
                                    // Actualizar datos del usuario si es necesario
                                    localStorage.setItem('user', JSON.stringify(response));

                                    set({
                                        user: response,
                                        isAuthenticated: true,
                                        isLoading: false,
                                        error: null,
                                    });
                                    return;
                                }
                            } catch (error) {
                                // Si falla la verificación del servidor, limpiar
                                localStorage.removeItem('auth-token');
                                localStorage.removeItem('user');
                            }
                        } else {
                            // Token expirado, limpiar
                            localStorage.removeItem('auth-token');
                            localStorage.removeItem('user');
                        }
                    }

                    // No hay sesión válida
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },
        }),
        {
            name: 'auth-storage', // nombre de la key en localStorage
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }), // solo persistir user e isAuthenticated
        }
    )
);
