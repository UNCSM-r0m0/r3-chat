import { useEffect } from 'react';
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

    const { isAuthenticated: hasToken, setToken } = useTokenStore();

    // Verificar autenticación al cargar la app
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Verificar si hay token en localStorage (fallback)
                const tokenData = localStorage.getItem('auth-token');
                if (tokenData) {
                    const parsed = JSON.parse(tokenData);
                    // Verificar si el token no ha expirado
                    if (parsed.expires && parsed.expires > Date.now()) {
                        if (!hasToken) {
                            setToken(parsed.token);
                        }
                        // Intentar obtener perfil para verificar sesión activa
                        await getProfile();
                    } else {
                        // Token expirado, limpiar
                        localStorage.removeItem('auth-token');
                        localStorage.removeItem('user');
                    }
                }
            } catch (error) {
                // Si falla, limpiar tokens y continuar sin autenticación
                console.log('No hay sesión activa');
                localStorage.removeItem('auth-token');
                localStorage.removeItem('user');
            }
        };

        checkAuth();
    }, [getProfile, hasToken, setToken]);

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
