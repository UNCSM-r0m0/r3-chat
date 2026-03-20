// Constantes de la aplicación
// Usa variables de entorno Vite (VITE_*) con fallback a valores locales

/// <reference types="vite/client" />

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
export const FRONTEND_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

// Debug logging (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('[config] API_BASE_URL:', API_BASE_URL);
  console.log('[config] WS_BASE_URL:', WS_BASE_URL);
  console.log('[config] FRONTEND_URL:', FRONTEND_URL);
}

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    GOOGLE: "/auth/google",
    GOOGLE_CALLBACK: "/auth/google/callback",
    GITHUB: "/auth/github",
    GITHUB_CALLBACK: "/auth/github/callback",
    LOGOUT: "/auth/logout",
  },
  // Chat
  CHAT: {
    LIST: "/chat",
    CREATE: "/chat",
    GET: "/chat/:id",
    UPDATE: "/chat/:id",
    DELETE: "/chat/:id",
    SEND_MESSAGE: "/chat/:id/message",
  },
  // Models
  MODELS: {
    LIST: "/models",
    GET: "/models/:id",
  },
  // Users
  USERS: {
    PROFILE: "/users/profile",
    UPDATE: "/users/profile",
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    GET: "/subscriptions",
    CREATE: "/subscriptions",
    UPDATE: "/subscriptions",
    CANCEL: "/subscriptions/cancel",
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user",
  SELECTED_MODEL: "selected_model",
  CHAT_HISTORY: "chat_history",
  THEME: "theme",
} as const;

export const SUGGESTED_QUESTIONS = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
] as const;

export const QUICK_ACTIONS = [
  {
    id: "create",
    label: "Create",
    icon: "sparkles",
    description: "Generate content and ideas",
  },
  {
    id: "explore",
    label: "Explore",
    icon: "folder",
    description: "Research and discover",
  },
  {
    id: "code",
    label: "Code",
    icon: "code",
    description: "Programming assistance",
  },
  {
    id: "learn",
    label: "Learn",
    icon: "graduation-cap",
    description: "Educational content",
  },
] as const;

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;
