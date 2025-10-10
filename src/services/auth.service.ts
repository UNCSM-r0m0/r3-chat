import { apiService } from './api';

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
}

interface AuthResponse {
    user: any;
    token: string;
    expiresIn?: number;
}


class AuthService {
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await apiService.login(data);
        return response.data;
    }

    async loginWithGoogle(token: string): Promise<AuthResponse> {
        // El token ya viene del callback de Google
        // Hacer una petición al perfil para obtener la información del usuario
        const response = await apiService.getProfile();

        // Construir la respuesta de autenticación
        return {
            token,
            user: response,
            expiresIn: 7 * 24 * 60 * 60 // 7 días en segundos
        };
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiService.register(data);
        return response.data;
    }

    async logout(): Promise<void> {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    async getProfile(): Promise<any> {
        const response = await apiService.getProfile();
        return response;
    }

    async refreshToken(): Promise<AuthResponse> {
        // Por ahora no implementamos refresh token
        throw new Error('Refresh token not implemented');
    }

    isAuthenticated(): boolean {
        // Verificar si hay token válido en localStorage
        const tokenData = localStorage.getItem('auth-token');
        if (tokenData) {
            try {
                const parsed = JSON.parse(tokenData);
                return parsed.expires && parsed.expires > Date.now();
            } catch {
                return false;
            }
        }
        return false;
    }

    getAccessToken(): string | undefined {
        const tokenData = localStorage.getItem('auth-token');
        if (tokenData) {
            try {
                const parsed = JSON.parse(tokenData);
                if (parsed.expires && parsed.expires > Date.now()) {
                    return parsed.token;
                }
            } catch {
                return undefined;
            }
        }
        return undefined;
    }

    getRefreshToken(): string | undefined {
        // Por ahora no implementamos refresh token separado
        return undefined;
    }

    // Método para verificar y limpiar tokens expirados
    checkAndCleanExpiredTokens(): void {
        const tokenData = localStorage.getItem('auth-token');
        if (tokenData) {
            try {
                const parsed = JSON.parse(tokenData);
                if (parsed.expires && parsed.expires <= Date.now()) {
                    // Token expirado, limpiar
                    localStorage.removeItem('auth-token');
                    localStorage.removeItem('user');
                }
            } catch {
                // Datos corruptos, limpiar
                localStorage.removeItem('auth-token');
                localStorage.removeItem('user');
            }
        }
    }
}

export default new AuthService();
