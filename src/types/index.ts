// Tipos principales de la aplicación

export interface User {
    id: string;
    email: string;
    name: string;
    role?: 'registered' | 'premium' | 'admin' | 'super_admin' | string;
    is_admin?: boolean;
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
    fileIds?: string[];
    attachments?: { id: string; name: string; contentType?: string }[];
    toolSteps?: ToolStep[];
    hasHtmlContent?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ToolStep {
    type: 'tool_start' | 'tool_result';
    toolName?: string;
    toolCallId?: string;
    content?: string;
    createdAt: string;
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
    model_id?: string;
    name: string;
    provider: string;
    description: string;
    maxTokens?: number;
    maxOutputTokens?: number;
    supportsImages?: boolean;
    supportsWebsiteAgent?: boolean;
    supportsReasoning?: boolean;
    isPremium: boolean;
    isPublic?: boolean;
    isActive?: boolean;
    isAvailable?: boolean;
    available?: boolean;
    features?: string[];
    defaultModel?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export type ChatMode = 'normal' | 'website_agent';

export interface ChatState {
    chats: Chat[];
    currentChat: Chat | null;
    isLoading: boolean;
    isSelectingChat: boolean;
    error: string | null;
    isStreaming: boolean;
    isLimitReached: boolean;
    mode: ChatMode;
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
    fileIds?: string[];
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

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    contentType: string;
    url?: string;
}

export interface Document {
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
}

export interface SandboxResult {
    id: string;
    conversationId: string;
    code: string;
    language: string;
    output: string;
    error?: string;
    executedAt: number;
}

export interface UserPreferences {
    display_name: string;
    profession: string;
    traits: string[];
    about_me: string;
    theme: string;
}
