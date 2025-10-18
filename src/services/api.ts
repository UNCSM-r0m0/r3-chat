import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants';
import { getOrCreateFingerprint } from '../utils/fingerprint';
import type {
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    ChatRequest,
    ChatResponse,
    User,
    Chat,
    AIModel
} from '../types';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 120000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                // Evita la página intersticial de ngrok en XHR
                'ngrok-skip-browser-warning': 'true',
            },
        });

        // Interceptor para agregar el token de autenticación
        this.api.interceptors.request.use(
            (config) => {
                // Obtener token desde localStorage (compatible con el store global)
                const tokenData = localStorage.getItem('auth-token');
                if (tokenData) {
                    try {
                        const parsed = JSON.parse(tokenData);
                        if (parsed.expires && parsed.expires > Date.now() && parsed.token) {
                            config.headers.Authorization = `Bearer ${parsed.token}`;
                        }
                    } catch (error) {
                        console.warn('Error parsing token from localStorage:', error);
                    }
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Interceptor para manejar respuestas y errores
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            (error) => {
                if (error.response?.status === 401) {
                    // Evitar loop: no redirigir si ya estamos en /login o /auth/callback
                    const path = window.location.pathname;
                    if (path !== '/login' && path !== '/auth/callback') {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // Métodos de autenticación
    async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
        const response = await this.api.post('/auth/login', credentials);
        return response.data;
    }

    async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
        const response = await this.api.post('/auth/register', userData);
        return response.data;
    }

    async getProfile(): Promise<User> {
        const response = await this.api.get('/auth/profile');
        return response.data;
    }

    async googleAuth(): Promise<void> {
        window.location.href = `${API_BASE_URL}/auth/google`;
    }

    async githubAuth(): Promise<void> {
        window.location.href = `${API_BASE_URL}/auth/github`;
    }

    async handleOAuthCallback(code: string, state: string): Promise<ApiResponse<{ user: User; token: string }>> {
        const response = await this.api.post('/auth/callback', { code, state });
        return response.data;
    }

    // Métodos de chat
    async getChats(): Promise<ApiResponse<Chat[]>> {
        console.log('🔍 [ApiService] getChats: Iniciando llamada a /chat');
        try {
            const response = await this.api.get('/chat');
            console.log('🔍 [ApiService] getChats: Respuesta HTTP:', response.status, response.data);
            return response.data;
        } catch (error: any) {
            console.log('🔍 [ApiService] getChats: Error HTTP:', error.response?.status, error.response?.data);
            throw error;
        }
    }

    async createChat(title: string, _model: string): Promise<ApiResponse<Chat>> {
        const response = await this.api.post('/chat', { title });
        return response.data;
    }

    async getChat(chatId: string): Promise<ApiResponse<Chat>> {
        const response = await this.api.get(`/chat/${chatId}`);
        return response.data;
    }

    async sendMessage(chatRequest: ChatRequest): Promise<ApiResponse<ChatResponse>> {
        // NOTA: Ya no dependemos de localStorage para detectar autenticación
        // El backend maneja esto con cookies HttpOnly y el blindaje extra implementado

        // Construir request para el backend
        const backendRequest: any = {
            content: chatRequest.message,
            model: chatRequest.model,
            context: chatRequest.context
        };

        // conversationId si es un UUID válido (el backend determinará si el usuario está autenticado)
        if (chatRequest.chatId) {
            const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (uuidV4Regex.test(chatRequest.chatId)) {
                backendRequest.conversationId = chatRequest.chatId;
            }
        }

        // Siempre agregar anonymousId como fallback
        try {
            backendRequest.anonymousId = await getOrCreateFingerprint();
        } catch (error) {
            console.warn('Error generating anonymous ID:', error);
        }

        // Usar endpoint público - el backend maneja la autenticación automáticamente
        const response = await this.api.post('/chat/message', backendRequest);
        return response.data;
    }

    async updateChat(chatId: string, updates: Partial<Chat>): Promise<ApiResponse<Chat>> {
        const response = await this.api.patch(`/chat/sessions/${chatId}`, updates);
        return response.data;
    }

    async deleteChat(chatId: string): Promise<ApiResponse<void>> {
        const response = await this.api.delete(`/chat/sessions/${chatId}`);
        return response.data;
    }

    // Métodos de modelos
    async getModels(): Promise<ApiResponse<AIModel[]>> {
        const response = await this.api.get('/models/public');
        return response.data;
    }

    async getModel(modelId: string): Promise<ApiResponse<AIModel>> {
        const response = await this.api.get(`/models/${modelId}`);
        return response.data;
    }

    // Métodos de usuario
    async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
        const response = await this.api.put('/users/profile', updates);
        return response.data;
    }

    // Métodos de suscripciones
    async getSubscription(): Promise<ApiResponse<any>> {
        const response = await this.api.get('/stripe/subscription');
        return response.data;
    }

    async createSubscription(plan: string): Promise<ApiResponse<any>> {
        const response = await this.api.post('/subscriptions', { plan });
        return response.data;
    }

    async cancelSubscription(): Promise<ApiResponse<void>> {
        const response = await this.api.post('/subscriptions/cancel');
        return response.data;
    }

    async logout(): Promise<void> {
        try {
            await this.api.post('/auth/logout');
        } finally {
            // Limpiar token de localStorage
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user');
            // Limpiar header Authorization
            delete this.api.defaults.headers.common['Authorization'];
        }
    }
}

export const apiService = new ApiService();
export default apiService;
