import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';
import { STORAGE_KEYS } from '../constants';
import type { AuthState, User, LoginRequest, RegisterRequest } from '../types';

interface AuthStore extends AuthState {
    // Actions
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => void;
    getProfile: () => Promise<void>;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
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
            login: async (credentials: LoginRequest) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await apiService.login(credentials);

                    if (response.success) {
                        const { user, token } = response.data;
                        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
                        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null
                        });
                    } else {
                        set({
                            isLoading: false,
                            error: response.message || 'Error al iniciar sesión'
                        });
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || 'Error al iniciar sesión'
                    });
                }
            },

            register: async (userData: RegisterRequest) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await apiService.register(userData);

                    if (response.success) {
                        const { user, token } = response.data;
                        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
                        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null
                        });
                    } else {
                        set({
                            isLoading: false,
                            error: response.message || 'Error al registrarse'
                        });
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || 'Error al registrarse'
                    });
                }
            },

            logout: () => {
                localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                set({
                    user: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            getProfile: async () => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await apiService.getProfile();

                    if (response.success) {
                        set({
                            user: response.data,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null
                        });
                    } else {
                        set({
                            isLoading: false,
                            error: response.message || 'Error al obtener perfil'
                        });
                    }
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || 'Error al obtener perfil'
                    });
                }
            },

            setUser: (user: User | null) => {
                set({ user, isAuthenticated: !!user });
            },

            setLoading: (isLoading: boolean) => {
                set({ isLoading });
            },

            setError: (error: string | null) => {
                set({ error });
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
