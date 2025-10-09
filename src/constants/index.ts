// Constantes de la aplicación

//export const API_BASE_URL = 'https://jeanett-uncolorable-pickily.ngrok-free.dev/api';
export const API_BASE_URL = 'http://localhost:3000/api';
export const FRONTEND_URL = 'http://localhost:5173';

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
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'gemini' as const,
        description: 'Fast and efficient model for quick responses',
        maxTokens: 1000000,
        supportsImages: false,
        supportsReasoning: false,
        isPremium: false,
        isAvailable: true,
    },
    {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        provider: 'gemini' as const,
        description: 'Lightweight version of Gemini Flash',
        maxTokens: 1000000,
        supportsImages: false,
        supportsReasoning: false,
        isPremium: false,
        isAvailable: true,
    },
    {
        id: 'gemini-2.5-flash-image',
        name: 'Gemini 2.5 Flash Image',
        provider: 'gemini' as const,
        description: 'Gemini Flash with image support',
        maxTokens: 1000000,
        supportsImages: true,
        supportsReasoning: false,
        isPremium: true,
        isAvailable: false,
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'gemini' as const,
        description: 'Most capable Gemini model',
        maxTokens: 2000000,
        supportsImages: true,
        supportsReasoning: true,
        isPremium: true,
        isAvailable: false,
    },
    {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai' as const,
        description: 'OpenAI\'s most capable model',
        maxTokens: 8192,
        supportsImages: false,
        supportsReasoning: true,
        isPremium: true,
        isAvailable: false,
    },
    {
        id: 'claude-4-sonnet',
        name: 'Claude 4 Sonnet',
        provider: 'claude' as const,
        description: 'Anthropic\'s balanced model',
        maxTokens: 200000,
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
