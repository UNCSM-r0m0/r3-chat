// Tipos principales de la aplicación

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    subscription?: Subscription;
    createdAt: string;
    updatedAt: string;
}

export interface Subscription {
    id: string;
    userId: string;
    plan: 'free' | 'pro' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    currentPeriodEnd: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}

export interface ChatMessage {
    id: string;
    chatId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    model?: string;
    tokens?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Chat {
    id: string;
    userId: string;
    title: string;
    model: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface AIModel {
    id: string;
    name: string;
    provider: 'openai' | 'gemini' | 'claude' | 'ollama' | 'deepseek';
    description: string;
    maxTokens: number;
    supportsImages: boolean;
    supportsReasoning: boolean;
    isPremium: boolean;
    isAvailable: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface ChatState {
    chats: Chat[];
    currentChat: Chat | null;
    isLoading: boolean;
    error: string | null;
    isStreaming: boolean;
}

export interface ModelState {
    models: AIModel[];
    selectedModel: AIModel | null;
    isLoading: boolean;
    error: string | null;
}

// Tipos para las respuestas de la API
export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface ChatRequest {
    message: string;
    model: string;
    chatId?: string;
    context?: string;
}

export interface ChatResponse {
    message: ChatMessage;
    chat: Chat;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
