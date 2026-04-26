// Constantes de la aplicación

// Detecta entorno en tiempo de ejecución (navegador)
const inferBaseUrl = () => {
  try {
    const h = typeof window !== "undefined" ? window.location.hostname : "";
    // Si estamos en r0lm0.dev (app deploy) usar API remota
    if (/\.r0lm0\.dev$/i.test(h)) return "https://api.r0lm0.dev/api/v1";
    // Localhost: usar backend local (go-saas-api gateway)
    if (h === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(h))
      return "http://localhost:13000/api/v1";
  } catch {
    void 0;
  }
  // Fallback razonable
  return "http://localhost:13000/api/v1";
};

export const API_BASE_URL = inferBaseUrl();
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
export const WS_BASE_URL = API_ORIGIN.replace(/^http/i, 'ws');
export const FRONTEND_URL = "https://r3chat.r0lm0.dev";

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
    LIST: "/chat/sessions",
    CREATE: "/chat",
    GET: "/chat/:id",
    UPDATE: "/chat/sessions/:id",
    DELETE: "/chat/sessions/:id",
    SEND_MESSAGE: "/chat/message",
    SEND_MESSAGE_STREAM: "/chat/message/stream",
  },
  // Models
  MODELS: {
    LIST: "/models/public",
    GET: "/models/:id",
  },
  // Users
  USERS: {
    PROFILE: "/users/profile",
    UPDATE: "/users/profile",
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    GET: "/stripe/subscription",
    CREATE: "/stripe/create-checkout-session",
    PORTAL: "/stripe/create-portal-session",
    CONFIRM: "/stripe/confirm-session",
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
