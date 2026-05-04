import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
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
    AIModel,
    UploadedFile,
    Document,
    SandboxResult,
    UserPreferences
} from '../types';


export type AdminProvider = {
    id: string;
    name: string;
    type: string;
    base_url: string;
    is_active: boolean;
    is_public: boolean;
    priority: number;
};

export type AdminModel = {
    id: string;
    provider_id: string;
    provider_name?: string;
    name: string;
    display_name: string;
    description?: string;
    max_tokens: number;
    context_window: number;
    supports_streaming: boolean;
    supports_images: boolean;
    is_active: boolean;
    is_public: boolean;
    is_premium: boolean;
};

type ChatBackendRequest = {
    content: string;
    model: string;
    context?: string;
    conversationId?: string;
    anonymousId?: string;
    fileIds?: string[];
    mode?: string;
};

type SseEventPayload = {
    event?: 'tool_start' | 'tool_result' | 'artifact' | 'error' | string;
    content?: string;
    finished?: boolean;
    conversationId?: string;
    error?: 'LIMIT_EXCEEDED' | 'PREMIUM_REQUIRED' | 'STREAM_ERROR' | string;
    message?: string;
    toolName?: string;
    toolCallId?: string;
    artifactId?: string;
    artifactType?: string;
};

type StreamHandlers = {
    onChunk: (content: string) => void;
    onFinish: (conversationId?: string) => void;
    onError: (error: { code?: string; message?: string }) => void;
    onToolEvent?: (event: { type: 'tool_start' | 'tool_result'; toolName?: string; toolCallId?: string; content?: string }) => void;
    onArtifact?: (artifactId: string, artifactType: string) => void;
};

type RequestMeta = {
    requestId: string;
    startedAt: number;
};

type RequestConfigWithMeta = InternalAxiosRequestConfig & {
    metadata?: RequestMeta;
};

const createRequestId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const AUTH_TOKEN_KEY = 'auth_token';

const readAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

const persistAccessTokenFromResponse = (payload: unknown): void => {
    if (typeof window === 'undefined' || typeof payload !== 'object' || payload === null) return;

    const data = (payload as { data?: { token?: unknown } }).data;
    const token = data?.token;
    const accessToken =
        typeof token === 'string'
            ? token
            : typeof token === 'object' && token !== null
              ? (token as { access_token?: string }).access_token
              : undefined;

    if (accessToken) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    }
};

const devLog = (message: string, payload?: unknown): void => {
    if (!import.meta.env.DEV) return;
    if (payload !== undefined) {
        console.debug(message, payload);
        return;
    }
    console.debug(message);
};

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 120000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Interceptor para agregar el token de autenticación
        this.api.interceptors.request.use(
            (config) => {
                const cfg = config as RequestConfigWithMeta;
                cfg.metadata = {
                    requestId: createRequestId(),
                    startedAt: performance.now(),
                };

                const method = (cfg.method || 'GET').toUpperCase();
                devLog(`[api][${cfg.metadata.requestId}] ${method} ${cfg.url}`);

                // Las cookies HTTP-only se envían automáticamente con withCredentials: true
                // En localhost también soportamos Authorization porque cookies Secure no viajan por HTTP.
                const token = readAccessToken();
                if (token) {
                    cfg.headers.Authorization = `Bearer ${token}`;
                }
                return cfg;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Interceptor para manejar respuestas y errores
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                const cfg = response.config as RequestConfigWithMeta;
                const elapsed = cfg.metadata ? Math.round(performance.now() - cfg.metadata.startedAt) : -1;
                const method = (cfg.method || 'GET').toUpperCase();
                devLog(
                    `[api][${cfg.metadata?.requestId || 'no-id'}] ${method} ${cfg.url} -> ${response.status} (${elapsed}ms)`
                );
                persistAccessTokenFromResponse(response.data);
                return response;
            },
            (error) => {
                const cfg = error?.config as RequestConfigWithMeta | undefined;
                const elapsed = cfg?.metadata ? Math.round(performance.now() - cfg.metadata.startedAt) : -1;
                const method = (cfg?.method || 'GET').toUpperCase();
                const status = error?.response?.status || 'ERR';
                devLog(
                    `[api][${cfg?.metadata?.requestId || 'no-id'}] ${method} ${cfg?.url || 'unknown'} -> ${status} (${elapsed}ms)`
                );

                if (error.response?.status === 401) {
                    // No redirigir inmediatamente - dejar que el componente maneje el error
                    // El auth store detectará el estado no autenticado en la siguiente petición
                    console.warn('[api] Sesión expirada o no autorizado');
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
        // Backend envuelve en ApiResponse { data, message, success }
        return response.data?.data || response.data;
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

    async getArtifact(id: string): Promise<ApiResponse<{ id: string; content: string; type: string; name: string }>> {
        const response = await this.api.get(`/artifacts/${id}`);
        return response.data;
    }

    // Métodos de chat
    async getChats(): Promise<ApiResponse<Chat[]>> {
        // Evitar respuestas 304/ETag en algunos proxies añadiendo bust param
        const response = await this.api.get('/chat/sessions', {
            params: { _ts: Date.now() },
        });
        return response.data;
    }

    async createChat(title: string, model: string): Promise<ApiResponse<Chat>> {
        void model;
        const response = await this.api.post('/chat', { title });
        return response.data;
    }

    async getChat(chatId: string): Promise<ApiResponse<Chat>> {
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidV4Regex.test(chatId)) {
            return {
                success: false,
                message: 'Chat local pendiente de sincronización',
                data: null as unknown as Chat,
            };
        }
        const response = await this.api.get(`/chat/${chatId}`);
        return response.data;
    }

    async sendMessage(chatRequest: ChatRequest): Promise<ApiResponse<ChatResponse>> {
        // NOTA: Ya no dependemos de localStorage para detectar autenticación
        // El backend maneja esto con cookies HttpOnly y el blindaje extra implementado

        // Construir request para el backend
        const backendRequest: ChatBackendRequest = {
            content: chatRequest.message,
            model: chatRequest.model,
            context: chatRequest.context,
            fileIds: chatRequest.fileIds,
            mode: chatRequest.mode,
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

    async streamMessage(chatRequest: ChatRequest, handlers: StreamHandlers): Promise<void> {
        const backendRequest: ChatBackendRequest = {
            content: chatRequest.message,
            model: chatRequest.model,
            context: chatRequest.context,
            fileIds: chatRequest.fileIds,
            mode: chatRequest.mode,
        };

        if (chatRequest.chatId) {
            const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (uuidV4Regex.test(chatRequest.chatId)) {
                backendRequest.conversationId = chatRequest.chatId;
            }
        }

        try {
            backendRequest.anonymousId = await getOrCreateFingerprint();
        } catch (error) {
            console.warn('Error generating anonymous ID for stream:', error);
        }

        const response = await fetch(`${API_BASE_URL}/chat/message/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(readAccessToken() ? { Authorization: `Bearer ${readAccessToken()}` } : {}),
            },
            credentials: 'include',
            body: JSON.stringify(backendRequest),
        });

        if (!response.ok || !response.body) {
            throw new Error(`SSE stream failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const processEvent = (rawEvent: string) => {
            const lines = rawEvent
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);

            const dataLines = lines
                .filter((line) => line.startsWith('data:'))
                .map((line) => line.slice(5).trim())
                .filter(Boolean);

            if (dataLines.length === 0) return;

            const dataText = dataLines.join('\n');

            try {
                const payload = JSON.parse(dataText) as SseEventPayload;

                if (payload.event === 'tool_start') {
                    handlers.onToolEvent?.({
                        type: 'tool_start',
                        toolName: payload.toolName,
                        toolCallId: payload.toolCallId,
                    });
                    return;
                }

                if (payload.event === 'tool_result') {
                    handlers.onToolEvent?.({
                        type: 'tool_result',
                        toolName: payload.toolName,
                        content: payload.content,
                    });
                    return;
                }

                if (payload.event === 'artifact') {
                    if (payload.artifactId && payload.artifactType) {
                        handlers.onArtifact?.(payload.artifactId, payload.artifactType);
                    }
                    return;
                }

                if (payload.event === 'error') {
                    handlers.onError({ code: 'STREAM_ERROR', message: payload.content || payload.message });
                    return;
                }

                if (payload.error) {
                    handlers.onError({ code: payload.error, message: payload.message });
                    return;
                }

                if (payload.content) {
                    handlers.onChunk(payload.content);
                }

                if (payload.finished) {
                    handlers.onFinish(payload.conversationId);
                }
            } catch {
                void 0;
            }
        };

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            let separatorIndex = buffer.indexOf('\n\n');
            while (separatorIndex >= 0) {
                const rawEvent = buffer.slice(0, separatorIndex);
                buffer = buffer.slice(separatorIndex + 2);
                processEvent(rawEvent);
                separatorIndex = buffer.indexOf('\n\n');
            }
        }

        if (buffer.trim()) {
            processEvent(buffer);
        }
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

    async getAdminProviders(): Promise<AdminProvider[]> {
        const response = await this.api.get('/admin/providers');
        return response.data?.providers || [];
    }

    async getAdminProviderModels(providerId: string): Promise<AdminModel[]> {
        const response = await this.api.get(`/admin/providers/${providerId}/models`);
        return response.data?.models || [];
    }

    async updateAdminModel(model: AdminModel): Promise<AdminModel> {
        const response = await this.api.patch(`/admin/models/${model.id}`, {
            name: model.name,
            display_name: model.display_name || model.name,
            description: model.description || '',
            max_tokens: model.max_tokens || 4096,
            context_window: model.context_window || model.max_tokens || 4096,
            supports_streaming: Boolean(model.supports_streaming),
            supports_images: Boolean(model.supports_images),
            is_active: Boolean(model.is_active),
            is_public: Boolean(model.is_public),
            is_premium: Boolean(model.is_premium),
        });
        return response.data;
    }

    // Métodos de usuario
    async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
        const response = await this.api.put('/users/profile', updates);
        return response.data;
    }

    // Métodos de suscripciones
    async getSubscription(): Promise<unknown> {
        const response = await this.api.get('/stripe/subscription');
        return response.data;
    }

    async createCheckoutSession(priceId: string): Promise<{ url: string; sessionId: string }> {
        const response = await this.api.post('/stripe/create-checkout-session', { priceId });
        return response.data;
    }

    async createBillingPortalSession(): Promise<{ url: string }> {
        const response = await this.api.post('/stripe/create-portal-session');
        return response.data;
    }

    async confirmCheckoutSession(sessionId: string): Promise<unknown> {
        // Prefer body to avoid URL parsing server-side quirks
        const response = await this.api.post('/stripe/confirm-session', { sessionId });
        return response.data;
    }

    async createSubscription(plan: string): Promise<ApiResponse<unknown>> {
        const response = await this.api.post('/subscriptions', { plan });
        return response.data;
    }

    async cancelSubscription(): Promise<ApiResponse<void>> {
        const response = await this.api.post('/subscriptions/cancel');
        return response.data;
    }

    async forgotPassword(email: string): Promise<ApiResponse<void>> {
        const response = await this.api.post('/auth/forgot-password', { email });
        return response.data;
    }

    async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
        const response = await this.api.post('/auth/reset-password', { token, new_password: newPassword });
        return response.data;
    }

    async logout(): Promise<void> {
        try {
            await this.api.post('/auth/logout');
        } finally {
            // Las cookies HTTP-only se limpian automáticamente por el servidor
            window.localStorage.removeItem(AUTH_TOKEN_KEY);
        }
    }

    // File upload
    async uploadFile(file: File): Promise<ApiResponse<UploadedFile>> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await this.api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Document retrieval
    async getDocument(id: string): Promise<ApiResponse<Document>> {
        const response = await this.api.get(`/documents/${id}`);
        return response.data;
    }

    // Sandbox execution
    async executeSandbox(code: string, language: string): Promise<ApiResponse<SandboxResult>> {
        const response = await this.api.post('/sandbox/execute', { code, language });
        return response.data;
    }

    // User preferences
    async getPreferences(): Promise<ApiResponse<UserPreferences>> {
        const response = await this.api.get('/users/preferences');
        return response.data;
    }

    async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
        const response = await this.api.put('/users/preferences', preferences);
        return response.data;
    }

    async suggestTraits(preferences: Partial<UserPreferences>, model = 'kimi-for-coding'): Promise<ApiResponse<{ traits: string[] }>> {
        const response = await this.api.post('/agent/suggest-traits', {
            display_name: preferences.display_name,
            profession: preferences.profession,
            about_me: preferences.about_me,
            model,
        });
        return response.data;
    }
}

export const apiService = new ApiService();
export default apiService;
