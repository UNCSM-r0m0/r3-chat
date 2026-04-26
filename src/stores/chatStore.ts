import { create } from 'zustand';
import { apiService } from '../services/api';
import { socketService } from '../services/socketService';
import type { ChatState, Chat, ChatMessage } from '../types';

let socketListenersBound = false;

type ApiErrorLike = {
    response?: {
        status?: number;
        data?: {
            message?: string;
            errorCode?: string;
        };
    };
    message?: string;
};

type StreamSocketError = {
    code?: string;
    message?: string;
    partialContent?: string;
};

type StreamEndPayload = {
    fullContent: string;
    conversationId?: string;
};

const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidConversationId = (value?: string): boolean => Boolean(value && uuidV4Regex.test(value));

const shouldProcessWsEvent = (currentChat: Chat | null, payloadChatId?: string): boolean => {
    if (!currentChat) {
        console.log('[DEBUG] shouldProcessWsEvent: NO currentChat');
        return false;
    }
    if (!payloadChatId) {
        console.log('[DEBUG] shouldProcessWsEvent: NO payloadChatId, allowing');
        return true;
    }
    if (payloadChatId === currentChat.id) {
        console.log('[DEBUG] shouldProcessWsEvent: MATCH', { payloadChatId, currentChatId: currentChat.id });
        return true;
    }
    if (isTransientChatId(currentChat.id)) {
        console.log('[DEBUG] shouldProcessWsEvent: TRANSIENT currentChat, allowing', { currentChatId: currentChat.id, payloadChatId });
        return true;
    }
    console.log('[DEBUG] shouldProcessWsEvent: REJECTING', { payloadChatId, currentChatId: currentChat.id });
    return false;
};

const userFacingBusinessMessage = (error: StreamSocketError): string => {
    switch (error.code) {
        case 'LIMIT_EXCEEDED':
            return error.message || 'Has alcanzado tu límite de mensajes por día.';
        case 'PREMIUM_REQUIRED':
            return error.message || 'Este modelo requiere una suscripción premium.';
        case 'STREAM_ERROR':
            return error.message || 'Error temporal de streaming. Intentando modo de respaldo...';
        default:
            return error.message || 'Error generando respuesta. Intenta nuevamente.';
    }
};

const logWsTelemetry = (eventName: string, payload: Record<string, unknown>): void => {
    if (!import.meta.env.DEV) return;
    console.debug(`[ws-telemetry] ${eventName}`, payload);
};

const wsStreamStartByChat = new Map<string, number>();

// Throttling para loadChats - evitar llamadas excesivas a Cloudflare
let lastLoadChatsTime = 0;
let loadChatsInProgress = false;
const LOAD_CHATS_COOLDOWN = 2000; // 2 segundos entre llamadas

// Chunk buffering para streaming - evitar re-renders excesivos
let chunkBuffer = '';
let chunkTimer: ReturnType<typeof setTimeout> | null = null;
const CHUNK_FLUSH_INTERVAL = 16; // ms (~1 RAF tick)

// Track transient client-generated chat IDs (not yet confirmed by server)
const transientChatIds = new Set<string>();

// Helper to generate UUID v4 for client-side optimistic chats
const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const isTransientChatId = (value?: string): boolean => {
    return Boolean(value && (value.startsWith('pending-') || transientChatIds.has(value)));
};

const flushChunkBuffer = (
    set: (fn: (state: ChatStore) => ChatStore | Partial<ChatStore>) => void, 
    get: () => ChatStore
): void => {
    if (chunkTimer) {
        clearTimeout(chunkTimer);
        chunkTimer = null;
    }
    
    const bufferToFlush = chunkBuffer;
    chunkBuffer = '';
    
    if (!bufferToFlush) return;
    
    const state = get();
    if (!state.currentChat) return;
    
    const chatId = state.currentChat.id;
    
    set((state) => {
        if (!state.currentChat) return state;
        
        const updatedMessages = state.currentChat.messages.map((msg) => {
            if (msg.id.startsWith('stream-')) {
                return { ...msg, content: msg.content + bufferToFlush };
            }
            return msg;
        });
        
        const updatedChat = {
            ...state.currentChat,
            messages: updatedMessages,
        };
        
        return {
            currentChat: updatedChat,
            chats: state.chats.map((chat) =>
                chat.id === chatId ? updatedChat : chat
            ),
        };
    });
};

const markWsStreamStart = (chatId: string): void => {
    wsStreamStartByChat.set(chatId, performance.now());
};

const consumeWsStreamDuration = (chatId?: string): number | undefined => {
    if (!chatId) return undefined;
    const startedAt = wsStreamStartByChat.get(chatId);
    if (!startedAt) return undefined;
    wsStreamStartByChat.delete(chatId);
    return performance.now() - startedAt;
};

const peekWsStreamDuration = (chatId?: string): number | undefined => {
    if (!chatId) return undefined;
    const startedAt = wsStreamStartByChat.get(chatId);
    if (!startedAt) return undefined;
    return performance.now() - startedAt;
};

const toApiError = (error: unknown): ApiErrorLike => {
    if (typeof error === 'object' && error !== null) {
        return error as ApiErrorLike;
    }
    return {};
};

const toStreamError = (error: unknown): StreamSocketError => {
    if (typeof error === 'object' && error !== null) {
        return error as StreamSocketError;
    }
    if (typeof error === 'string') {
        return { message: error };
    }
    return {};
};

interface ChatStore extends ChatState {
    // Actions
    loadChats: () => Promise<void>;
    createChat: (title: string, model: string) => Promise<Chat | null>;
    selectChat: (chat: Chat | null) => Promise<void>;
    sendMessage: (message: string, model: string) => Promise<void>;
    updateChat: (chatId: string, updates: Partial<Chat>) => Promise<void>;
    deleteChat: (chatId: string) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setStreaming: (streaming: boolean) => void;
    clearError: () => void;
    // WebSocket actions
    initializeSocket: () => void;
    disconnectSocket: () => void;
    // Streaming actions
    updateStreamingMessage: (content: string) => void;
    completeStreamingMessage: (content: string) => void;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
    // Estado inicial
    chats: [],
    currentChat: null,
    isLoading: false,
    isSelectingChat: false,
    error: null,
    isStreaming: false,
    isLimitReached: false,

    // Actions
    loadChats: async () => {
        // Throttling: evitar llamadas si ya hay una en progreso o si pasaron menos de 2 segundos
        const now = Date.now();
        if (loadChatsInProgress) {
            try { console.debug('[loadChats] skipped: request already in progress'); } catch { void 0; }
            return;
        }
        if (now - lastLoadChatsTime < LOAD_CHATS_COOLDOWN) {
            try { console.debug('[loadChats] skipped: cooldown period'); } catch { void 0; }
            return;
        }
        
        loadChatsInProgress = true;
        lastLoadChatsTime = now;
        
        try {
            set({ isLoading: true, error: null });
            const response = await apiService.getChats();

            if (response.success) {
                try { console.debug('[loadChats] success:', Array.isArray(response.data) ? response.data.length : response); } catch { void 0; }
                set({
                    chats: response.data || [],
                    isLoading: false,
                    error: null
                });
            } else {
                try { console.warn('[loadChats] backend returned success=false:', response); } catch { void 0; }
                set({
                    isLoading: false,
                    error: response.message || 'Error al cargar chats'
                });
            }
        } catch (error: unknown) {
            const apiError = toApiError(error);
            try { console.error('[loadChats] request error:', apiError.response?.status, apiError.response?.data || apiError.message || error); } catch { void 0; }
            set({
                isLoading: false,
                error: apiError.response?.data?.message || 'Error al cargar chats'
            });
        } finally {
            loadChatsInProgress = false;
        }
    },

    createChat: async (title: string, model: string) => {
        try {
            set({ isLoading: true, error: null });
            const response = await apiService.createChat(title, model);

            if (response.success) {
                const newChat = response.data;

                // WebSocket nativo no requiere joinChat, el servidor maneja esto por conversationId

                set((state) => ({
                    chats: [newChat, ...state.chats],
                    currentChat: newChat,
                    isLoading: false,
                    error: null,
                }));

                // No llamar loadChats aquí - evitar peticiones duplicadas
                // El chat ya está en la lista
                return newChat;
            } else {
                set({
                    isLoading: false,
                    error: response.message || 'Error al crear chat'
                });
                return null;
            }
        } catch (error: unknown) {
            const apiError = toApiError(error);
            set({
                isLoading: false,
                error: apiError.response?.data?.message || 'Error al crear chat'
            });
            return null;
        }
    },

    selectChat: async (chat: Chat | null) => {
        if (!chat) {
            set({ currentChat: null, isSelectingChat: false });
            return;
        }

        try {
            // Mostrar inmediatamente el chat seleccionado para no dejar la UI en blanco
            set({ currentChat: chat, isLoading: true, isSelectingChat: true, error: null });

            // WebSocket nativo no requiere joinChat, el servidor maneja esto por conversationId

            // Siempre cargar del backend para asegurar historial completo
            const response = await apiService.getChat(chat.id);

            if (response.success) {
                const updatedChat = response.data;
                set({
                    currentChat: updatedChat,
                    chats: get().chats.map(c =>
                        c.id === chat.id ? updatedChat : c
                    ),
                    isLoading: false,
                    isSelectingChat: false,
                    error: null
                });
            } else {
                // Si falla la carga del backend, mantenemos el chat local como fallback
                console.warn('Error cargando chat del backend, usando datos locales:', response.message);
                set({
                    currentChat: chat,
                    isLoading: false,
                    isSelectingChat: false,
                    error: null
                });
            }
        } catch (error: unknown) {
            console.error('Error en selectChat:', error);
            // Fallback: usar el chat local si falla la carga
            set({
                currentChat: chat,
                isLoading: false,
                isSelectingChat: false,
                error: null
            });
        }
    },

    sendMessage: async (message: string, model: string) => {
        const { currentChat } = get();
        const now = new Date().toISOString();
        const hasActiveChat = Boolean(currentChat);
        const tempChatId = currentChat?.id || generateUUID();

        // Track client-generated UUIDs as transient so WS guards accept them
        if (!hasActiveChat) {
            transientChatIds.add(tempChatId);
        }

        try {
            // 1. Agregar mensaje del usuario inmediatamente (como ChatGPT5)
            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                chatId: tempChatId,
                role: 'user',
                content: message,
                createdAt: now,
                updatedAt: now,
            };

            // 2. Crear mensaje temporal para streaming
            const streamingMessage: ChatMessage = {
                id: `stream-${Date.now()}`,
                chatId: tempChatId,
                role: 'assistant',
                content: '',
                createdAt: now,
                updatedAt: now,
            };

            // Actualizar SOLO currentChat; NO agregar a chats (sidebar) todavía
            set((state) => {
                const baseChat: Chat = state.currentChat || {
                    id: tempChatId,
                    userId: '',
                    title: message.slice(0, 60),
                    model,
                    messages: [],
                    createdAt: now,
                    updatedAt: now,
                };

                const updatedChat = {
                    ...baseChat,
                    model,
                    updatedAt: now,
                    messages: [...(Array.isArray(baseChat.messages) ? baseChat.messages : []), userMessage, streamingMessage],
                };

                return {
                    currentChat: updatedChat,
                    isStreaming: true,
                    error: null,
                    isLimitReached: false,
                };
            });

            // 3. Iniciar streaming via WebSocket
            await socketService.sendMessage({
                message,
                chatId: hasActiveChat ? currentChat?.id || '' : tempChatId,
                model,
            });
        } catch (error: unknown) {
            console.error('Error enviando mensaje via WebSocket:', error);

            // Limpiar estado optimista y re-lanzar para que el catch externo muestre error
            set((state) => {
                if (!state.currentChat) {
                    transientChatIds.delete(tempChatId);
                    return { isStreaming: false };
                }
                const cleanedMessages = state.currentChat.messages.filter(
                    (msg) => !msg.id.startsWith('stream-')
                );
                const updatedChat = {
                    ...state.currentChat,
                    messages: cleanedMessages,
                };
                return {
                    currentChat: updatedChat,
                    chats: state.chats.map((c) => (c.id === updatedChat.id ? updatedChat : c)),
                    isStreaming: false,
                };
            });
            transientChatIds.delete(tempChatId);
            throw error;
        }
    },

    // Funciones para WebSocket
    initializeSocket: () => {
        if (socketListenersBound) return;

        // console.log('Inicializando WebSocket...');
        socketService.connect();
        socketListenersBound = true;

        // Configurar listeners para respuestas
        socketService.onResponseStart((data) => {
            set((state) => {
                if (!shouldProcessWsEvent(state.currentChat, data.chatId)) return state;
                const activeChat = state.currentChat;
                if (!activeChat) return state;

                const updatedMessages = activeChat.messages.map((msg) => {
                    if (msg.id.startsWith('stream-')) {
                        return { ...msg, content: data.content };
                    }
                    return msg;
                });

                const updatedChat = {
                    ...activeChat,
                    messages: updatedMessages,
                };

                logWsTelemetry('ws_stream_started', {
                    chatId: data.chatId || activeChat.id,
                    messageId: data.messageId,
                    model: activeChat.model,
                });
                markWsStreamStart(data.chatId || activeChat.id);

                // Si es un chat transiente (primera vez), agregarlo al sidebar ahora
                const alreadyInList = state.chats.some((c) => c.id === activeChat.id);
                const nextChats = alreadyInList
                    ? state.chats.map((c) => (c.id === activeChat.id ? updatedChat : c))
                    : [updatedChat, ...state.chats];

                return {
                    currentChat: updatedChat,
                    chats: nextChats,
                };
            });
        });

socketService.onResponseChunk((data) => {
            // Buffer chunks and flush periodically to avoid excessive re-renders
            chunkBuffer += data.content;
            
            if (!chunkTimer) {
                // Flush immediately for first chunk, then start timer
                const currentState = get();
                if (currentState.currentChat) {
                    const chatId = currentState.currentChat.id;
                    const bufferToFlush = chunkBuffer;
                    chunkBuffer = '';
                    
                    set((innerState) => {
                        if (!innerState.currentChat) return innerState;
                        
                        // Check if there's already a streaming message
                        const hasStreamingMsg = innerState.currentChat.messages.some((msg) => 
                            msg.id.startsWith('stream-')
                        );
                        
                        let updatedMessages;
                        if (hasStreamingMsg) {
                            // Update existing streaming message
                            updatedMessages = innerState.currentChat.messages.map((msg) => {
                                if (msg.id.startsWith('stream-')) {
                                    return { ...msg, content: msg.content + bufferToFlush };
                                }
                                return msg;
                            });
                        } else {
                            // Create new streaming message if none exists
                            const streamingMsg: ChatMessage = {
                                id: `stream-${Date.now()}`,
                                chatId: innerState.currentChat.id,
                                role: 'assistant',
                                content: bufferToFlush,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            };
                            updatedMessages = [...innerState.currentChat.messages, streamingMsg];
                        }
                        
                        const updatedChat = {
                            ...innerState.currentChat,
                            messages: updatedMessages,
                        };
                        
                        return {
                            currentChat: updatedChat,
                            chats: innerState.chats.map((chat) =>
                                chat.id === chatId ? updatedChat : chat
                            ),
                        };
                    });
                }
                
                chunkTimer = setTimeout(() => {
                    chunkTimer = null;
                    if (chunkBuffer) {
                        flushChunkBuffer(set, get);
                    }
                }, CHUNK_FLUSH_INTERVAL);
            }
            // If timer is running, chunk is already in buffer and will be flushed soon
        });

        socketService.onResponseEnd((data: StreamEndPayload & { chatId?: string; messageId?: string; finished?: boolean }) => {
            // Flush any remaining buffered chunks before completing
            if (chunkBuffer || chunkTimer) {
                flushChunkBuffer(set, get);
            }
            
            set((state) => {
                if (!shouldProcessWsEvent(state.currentChat, data.chatId)) return state;
                const activeChat = state.currentChat;
                if (!activeChat) return state;

                const updatedMessages = activeChat.messages.map((msg) => {
                    if (msg.id.startsWith('stream-')) {
                        return {
                            ...msg,
                            content: data.fullContent,
                            id: `assistant-${Date.now()}`,
                            updatedAt: new Date().toISOString(),
                        };
                    }
                    return msg;
                });

                const updatedChat = {
                    ...activeChat,
                    messages: updatedMessages,
                };

                logWsTelemetry('ws_stream_completed', {
                    chatId: data.chatId || activeChat.id,
                    conversationId: data.conversationId,
                    messageId: data.messageId,
                    model: activeChat.model,
                    finished: data.finished,
                    durationMs: consumeWsStreamDuration(data.chatId || activeChat.id),
                });

                const alreadyInList = state.chats.some((c) => c.id === activeChat.id);
                const nextChats = alreadyInList
                    ? state.chats.map((chat) => (chat.id === activeChat.id ? updatedChat : chat))
                    : [updatedChat, ...state.chats];

                return {
                    currentChat: updatedChat,
                    chats: nextChats,
                    isStreaming: false,
                    error: null,
                };
            });

            // Rehidratar chat para asegurar título y mensajes sincronizados con el servidor
            if (isValidConversationId(data.conversationId)) {
                void (async () => {
                    try {
                        const state = get();
                        const currentChat = state.currentChat;
                        // Rehidratar siempre para chats transientes; también si el ID cambió o no tiene título real
                        const needsRehydration = isTransientChatId(currentChat?.id) || 
                                                 (currentChat?.id !== data.conversationId) ||
                                                 !currentChat?.title || 
                                                 currentChat.title === 'Nuevo Chat';
                        
                        if (!needsRehydration) {
                            // El chat ya tiene datos válidos, solo actualizamos el ID si es necesario
                            if (currentChat && currentChat.id !== data.conversationId) {
                                const updatedChat = { ...currentChat, id: data.conversationId as string };
                                set({
                                    currentChat: updatedChat,
                                    chats: state.chats.map((chat) =>
                                        chat.id === currentChat.id ? updatedChat : chat
                                    ),
                                });
                            }
                            return;
                        }
                        
                        const chatResponse = await apiService.getChat(data.conversationId as string);
                        if (chatResponse.success) {
                            const hydratedChat = chatResponse.data;
                            set((state) => {
                                // Filtrar chats transientes para evitar duplicados
                                const filteredChats = state.chats.filter(c => 
                                    !isTransientChatId(c.id) && c.id !== hydratedChat.id
                                );
                                const existingChat = state.chats.find(c => c.id === hydratedChat.id);
                                
                                // Limpiar el ID transiente del set
                                transientChatIds.delete(state.currentChat?.id || '');
                                
                                return {
                                    currentChat: hydratedChat,
                                    chats: existingChat
                                        ? state.chats.map((chat) => (chat.id === hydratedChat.id ? hydratedChat : chat))
                                        : [hydratedChat, ...filteredChats],
                                };
                            });
                        }
                    } catch (rehydrateError) {
                        console.warn('No se pudo rehidratar conversación al finalizar stream', rehydrateError);
                    }
                })();
            }
        });

        socketService.onError((error: unknown) => {
            console.error('❌ Error de WebSocket:', error);
            const streamError = toStreamError(error);
            const errorCode = streamError.code || '';
            const businessMessage = userFacingBusinessMessage(streamError);
            const streamState = get().currentChat;

            logWsTelemetry('ws_stream_failed', {
                chatId: streamState?.id,
                code: errorCode,
                model: streamState?.model,
                durationMs: consumeWsStreamDuration(streamState?.id),
            });

            // Detectar límite de mensajes
            if (errorCode === 'LIMIT_EXCEEDED' || /LIMIT_EXCEEDED/i.test(errorCode)) {
                set((state) => {
                    const assistantMsg: ChatMessage = {
                        id: `assistant-${Date.now()}`,
                        chatId: state.currentChat?.id || '',
                        role: 'assistant',
                        content: businessMessage,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    const updatedChat = state.currentChat ? {
                        ...state.currentChat,
                        messages: [...state.currentChat.messages, assistantMsg],
                    } : state.currentChat;
                    return {
                        currentChat: updatedChat || null,
                        chats: updatedChat ? state.chats.map(c => c.id === updatedChat.id ? updatedChat : c) : state.chats,
                        isStreaming: false,
                        isLimitReached: true,
                        error: null,
                    };
                });
                return;
            }

            if (errorCode === 'PREMIUM_REQUIRED') {
                set((state) => {
                    const assistantMsg: ChatMessage = {
                        id: `assistant-${Date.now()}`,
                        chatId: state.currentChat?.id || '',
                        role: 'assistant',
                        content: businessMessage,
                        isError: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };

                    const updatedChat = state.currentChat ? {
                        ...state.currentChat,
                        messages: [...state.currentChat.messages.filter((msg) => !msg.id.startsWith('stream-')), assistantMsg],
                    } : state.currentChat;

                    return {
                        currentChat: updatedChat || null,
                        chats: updatedChat ? state.chats.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)) : state.chats,
                        isStreaming: false,
                        error: null,
                    };
                });
                return;
            }

            // Manejar errores de streaming (incluye STREAM_ERROR, LLM_STUDIO_UNAVAILABLE, CONNECTION_REFUSED, etc.)
            const streamingErrorCodes = ['STREAM_ERROR', 'LLM_STUDIO_UNAVAILABLE', 'CONNECTION_REFUSED', 'TIMEOUT_ERROR', 'QUOTA_EXCEEDED', 'RATE_LIMIT', 'AUTH_ERROR'];
            if (errorCode === 'STREAM_ERROR' || streamingErrorCodes.includes(errorCode)) {
                if (errorCode === 'STREAM_ERROR') {
                    const stateBeforeFallback = get();
                    const userInput = [...(stateBeforeFallback.currentChat?.messages || [])]
                        .reverse()
                        .find((msg) => msg.role === 'user')?.content;
                    const activeChatId = isValidConversationId(stateBeforeFallback.currentChat?.id)
                        ? stateBeforeFallback.currentChat?.id
                        : undefined;
                    const selectedModel = stateBeforeFallback.currentChat?.model || 'qwen2.5-coder-7b';

                    if (userInput) {
                        void (async () => {
                            try {
                                const fallbackResponse = await apiService.sendMessage({
                                    message: userInput,
                                    model: selectedModel,
                                    chatId: activeChatId,
                                });

                                if (fallbackResponse.success && fallbackResponse.data?.chat) {
                                    const rehydratedChat = fallbackResponse.data.chat;
                                    set((state) => ({
                                        currentChat: rehydratedChat,
                                        chats: state.chats.some((chat) => chat.id === rehydratedChat.id)
                                            ? state.chats.map((chat) => (chat.id === rehydratedChat.id ? rehydratedChat : chat))
                                            : [rehydratedChat, ...state.chats],
                                        isStreaming: false,
                                        error: null,
                                    }));
                                    // No llamar loadChats aquí - evitar peticiones excesivas en errores
                                    return;
                                }
                            } catch (fallbackError) {
                                console.warn('Fallback HTTP /chat/message falló', fallbackError);
                            }

                            set((state) => ({
                                ...state,
                                isStreaming: false,
                                error: 'No se pudo completar en tiempo real, intentaremos modo normal.',
                            }));
                        })();
                        return;
                    }
                }

                set((state) => {
                    if (!state.currentChat) {
                        return {
                            isStreaming: false,
                            error: businessMessage,
                        };
                    }

                    // Si hay contenido parcial, actualizar el mensaje con ese contenido
                    let updatedMessages = state.currentChat.messages;
                    if (streamError.partialContent && streamError.partialContent.length > 0) {
                        updatedMessages = state.currentChat.messages.map(msg => {
                            if (msg.id.startsWith('stream-')) {
                                return {
                                    ...msg,
                                    content: streamError.partialContent || '',
                                    id: `assistant-${Date.now()}`,
                                    updatedAt: new Date().toISOString(),
                                };
                            }
                            return msg;
                        });
                    } else {
                        // Remover mensaje de "pensando..." si no hay contenido parcial
                        updatedMessages = state.currentChat.messages.filter(
                            msg => !msg.id.startsWith('stream-')
                        );
                    }

                    // Agregar mensaje de error si no hay contenido parcial
                    if (!streamError.partialContent || streamError.partialContent.length === 0) {
                        const errorMsg: ChatMessage = {
                            id: `error-${Date.now()}`,
                            chatId: state.currentChat.id,
                            role: 'assistant',
                            content: `❌ ${businessMessage}`,
                            isError: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };
                        updatedMessages = [...updatedMessages, errorMsg];
                    }

                    const updatedChat = {
                        ...state.currentChat,
                        messages: updatedMessages,
                    };

                    return {
                        currentChat: updatedChat,
                        chats: state.chats.map(c => c.id === updatedChat.id ? updatedChat : c),
                        isStreaming: false,
                        error: streamError.partialContent ? null : businessMessage,
                    };
                });
                return;
            }

            // Error genérico
            set((state) => {
                // Remover mensaje de "pensando..." si existe
                if (state.currentChat) {
                    const updatedMessages = state.currentChat.messages.filter(
                        msg => !msg.id.startsWith('stream-')
                    );
                    const updatedChat = {
                        ...state.currentChat,
                        messages: updatedMessages,
                    };
                    return {
                        currentChat: updatedChat,
                        chats: state.chats.map(c => c.id === updatedChat.id ? updatedChat : c),
                        isStreaming: false,
                        error: `Error de conexión: ${streamError.message || 'desconocido'}`,
                    };
                }
                return {
                    isStreaming: false,
                    error: `Error de conexión: ${streamError.message || 'desconocido'}`,
                };
            });
        });

        socketService.onDisconnected(() => {
            set((state) => {
                if (!state.isStreaming || !state.currentChat) return state;

                const hasStreamingPlaceholder = state.currentChat.messages.some((msg) => msg.id.startsWith('stream-'));
                if (!hasStreamingPlaceholder) return state;

                const updatedMessages = state.currentChat.messages.map((msg) => {
                    if (msg.id.startsWith('stream-')) {
                        return {
                            ...msg,
                            id: `assistant-${Date.now()}`,
                            content: 'Stream interrumpido. Puedes reintentar el envio.',
                            isError: true,
                            updatedAt: new Date().toISOString(),
                        };
                    }
                    return msg;
                });

                const updatedChat = {
                    ...state.currentChat,
                    messages: updatedMessages,
                };

                return {
                    currentChat: updatedChat,
                    chats: state.chats.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)),
                    isStreaming: false,
                    error: 'Conexion interrumpida durante stream.',
                };
            });
        });

        socketService.onReconnected(() => {
            const streamState = get().currentChat;
            logWsTelemetry('ws_stream_reconnected', {
                chatId: streamState?.id,
                model: streamState?.model,
                durationMs: peekWsStreamDuration(streamState?.id),
            });
        });
    },

    disconnectSocket: () => {
        if (!socketListenersBound) return;

        // console.log('Desconectando WebSocket...');
        socketService.removeAllListeners();
        socketService.disconnect();
        socketListenersBound = false;
    },

    // Funciones para streaming
    updateStreamingMessage: (content: string) => {
        set((state) => {
            if (!state.currentChat) return state;

            const updatedMessages = state.currentChat.messages.map(msg => {
                if (msg.id.startsWith('stream-')) {
                    return { ...msg, content };
                }
                return msg;
            });

            const updatedChat = {
                ...state.currentChat,
                messages: updatedMessages,
            };

            return {
                currentChat: updatedChat,
                chats: state.chats.map(c =>
                    c.id === state.currentChat?.id ? updatedChat : c
                ),
            };
        });
    },

    completeStreamingMessage: (content: string) => {
        set((state) => {
            if (!state.currentChat) return state;

            const updatedMessages = state.currentChat.messages.map(msg => {
                if (msg.id.startsWith('stream-')) {
                    return {
                        ...msg,
                        content,
                        id: `assistant-${Date.now()}`, // Cambiar ID temporal por permanente
                        updatedAt: new Date().toISOString(),
                    };
                }
                return msg;
            });

            const updatedChat = {
                ...state.currentChat,
                messages: updatedMessages,
            };

            return {
                currentChat: updatedChat,
                chats: state.chats.map(c =>
                    c.id === state.currentChat?.id ? updatedChat : c
                ),
                isStreaming: false,
                error: null,
            };
        });
    },

    updateChat: async (chatId: string, updates: Partial<Chat>) => {
        try {
            set({ isLoading: true, error: null });
            const response = await apiService.updateChat(chatId, updates);

            if (response.success) {
                const updatedChat = response.data;
                set((state) => ({
                    chats: state.chats.map(chat =>
                        chat.id === chatId ? updatedChat : chat
                    ),
                    currentChat: state.currentChat?.id === chatId ? updatedChat : state.currentChat,
                    isLoading: false,
                    error: null,
                }));
                // No llamar loadChats aquí - el estado local ya está actualizado
            } else {
                set({
                    isLoading: false,
                    error: response.message || 'Error al actualizar chat'
                });
            }
        } catch (error: unknown) {
            const apiError = toApiError(error);
            set({
                isLoading: false,
                error: apiError.response?.data?.message || 'Error al actualizar chat'
            });
        }
    },

    deleteChat: async (chatId: string) => {
        try {
            set({ isLoading: true, error: null });
            const response = await apiService.deleteChat(chatId);

            if (response.success) {
                set((state) => ({
                    chats: state.chats.filter(chat => chat.id !== chatId),
                    currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
                    isLoading: false,
                    error: null,
                }));
                // No llamar loadChats aquí - el estado local ya está actualizado
            } else {
                set({
                    isLoading: false,
                    error: response.message || 'Error al eliminar chat'
                });
            }
        } catch (error: unknown) {
            const apiError = toApiError(error);
            set({
                isLoading: false,
                error: apiError.response?.data?.message || 'Error al eliminar chat'
            });
        }
    },

    addMessage: (message: ChatMessage) => {
        set((state) => {
            if (!state.currentChat) return state;

            const updatedChat = {
                ...state.currentChat,
                messages: [...(Array.isArray(state.currentChat.messages) ? state.currentChat.messages : []), message],
            };

            return {
                currentChat: updatedChat,
                chats: state.chats.map(chat =>
                    chat.id === state.currentChat?.id ? updatedChat : chat
                ),
            };
        });
    },

    setLoading: (isLoading: boolean) => {
        set({ isLoading });
    },

    setError: (error: string | null) => {
        set({ error });
    },

    setStreaming: (isStreaming: boolean) => {
        set({ isStreaming });
    },

    clearError: () => {
        set({ error: null, isLimitReached: false });
    },
}));

