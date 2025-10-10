import { useAuthStore } from '../stores/auth.store';

export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshToken,
        clearError,
        setUser,
        checkAuth,
    } = useAuthStore();

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshToken,
        clearError,
        setUser,
        checkAuth,
    };
};
