// Constantes de la aplicación

// Detecta entorno en tiempo de ejecución (navegador)
const inferBaseUrl = () => {
    try {
        const h = typeof window !== 'undefined' ? window.location.hostname : '';
        // Si estamos en r0lm0.dev (app deploy) usar API remota
        if (/\.r0lm0\.dev$/i.test(h)) return 'https://api.r0lm0.dev/api';
        // Localhost: usar backend local
        if (h === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(h)) return 'http://localhost:3000/api';
    } catch {}
    // Fallback razonable
    return 'http://localhost:3000/api';
};

export const API_BASE_URL = inferBaseUrl();
export const FRONTEND_URL = 'https://app.r0lm0.dev';

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        PROFILE: '/auth/profile',
        GOOGLE: '/auth/google',
        GOOGLE_CALLBACK: '/auth/google/callback',
        GITHUB: '/auth/github',
        GITHUB_CALLBACK: '/auth/github/callback',
        LOGOUT: '/auth/logout',
    },
    // Chat
    CHAT: {
        LIST: '/chat',
        CREATE: '/chat',
        GET: '/chat/:id',
        UPDATE: '/chat/:id',
        DELETE: '/chat/:id',
        SEND_MESSAGE: '/chat/:id/message',
    },
    // Models
    MODELS: {
        LIST: '/models',
        GET: '/models/:id',
    },
    // Users
    USERS: {
        PROFILE: '/users/profile',
        UPDATE: '/users/profile',
    },
    // Subscriptions
    SUBSCRIPTIONS: {
        GET: '/subscriptions',
        CREATE: '/subscriptions',
        UPDATE: '/subscriptions',
        CANCEL: '/subscriptions/cancel',
    },
} as const;

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER: 'user',
    SELECTED_MODEL: 'selected_model',
    CHAT_HISTORY: 'chat_history',
    THEME: 'theme',
} as const;

export const AI_MODELS = [
    {
        id: 'deepseek-r1:7b',
        name: 'DeepSeek R1 7B',
        provider: 'ollama' as const,
        description: 'Modelo local avanzado con capacidades de razonamiento',
        maxTokens: 32768,
        supportsImages: false,
        supportsReasoning: true,
        isPremium: false,
        isAvailable: true,
    },
    {
        id: 'llama3.2:3b',
        name: 'Llama 3.2 3B',
        provider: 'ollama' as const,
        description: 'Modelo local rápido y eficiente',
        maxTokens: 16384,
        supportsImages: false,
        supportsReasoning: false,
        isPremium: false,
        isAvailable: true,
    },
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'gemini' as const,
        description: 'Modelo avanzado de Google con capacidades multimodales',
        maxTokens: 1000000,
        supportsImages: true,
        supportsReasoning: true,
        isPremium: true,
        isAvailable: false,
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'gemini' as const,
        description: 'Modelo más avanzado de Google',
        maxTokens: 2000000,
        supportsImages: true,
        supportsReasoning: true,
        isPremium: true,
        isAvailable: false,
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai' as const,
        description: 'Modelo de OpenAI optimizado para chat',
        maxTokens: 128000,
        supportsImages: true,
        supportsReasoning: true,
        isPremium: true,
        isAvailable: false,
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai' as const,
        description: 'Modelo más avanzado de OpenAI',
        maxTokens: 128000,
        supportsImages: true,
        supportsReasoning: true,
        isPremium: true,
        isAvailable: false,
    },
] as const;

export const SUGGESTED_QUESTIONS = [
    'How does AI work?',
    'Are black holes real?',
    'How many Rs are in the word "strawberry"?',
    'What is the meaning of life?',
] as const;

export const QUICK_ACTIONS = [
    {
        id: 'create',
        label: 'Create',
        icon: 'sparkles',
        description: 'Generate content and ideas',
    },
    {
        id: 'explore',
        label: 'Explore',
        icon: 'folder',
        description: 'Research and discover',
    },
    {
        id: 'code',
        label: 'Code',
        icon: 'code',
        description: 'Programming assistance',
    },
    {
        id: 'learn',
        label: 'Learn',
        icon: 'graduation-cap',
        description: 'Educational content',
    },
] as const;

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
} as const;
