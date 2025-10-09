// import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTokenStore } from '../stores/tokenStore';

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

    const { isAuthenticated: hasToken } = useTokenStore();

    // Verificar autenticación al cargar la app: con cookies no leemos localStorage
    // Comentado temporalmente para evitar conflictos con OAuthCallback
    // useEffect(() => {
    //     getProfile().catch(() => { });
    // }, [getProfile]);

    return {
        user,
        isAuthenticated: isAuthenticated || hasToken, // Combinar ambos estados
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
