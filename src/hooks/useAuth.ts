import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        getProfile,
        setUser,
        clearError,
    } = useAuthStore();

    // Verificar autenticación al cargar la app: con cookies no leemos localStorage
    useEffect(() => {
        getProfile().catch(() => { });
    }, [getProfile]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        getProfile,
        setUser,
        clearError,
    };
};
