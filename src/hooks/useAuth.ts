import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { STORAGE_KEYS } from '../constants';

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

    // Verificar autenticación al cargar la app
    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                // Verificar con el servidor para asegurar que el token sigue siendo válido
                getProfile();
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                logout();
            }
        }
    }, [setUser, logout, getProfile]);

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
