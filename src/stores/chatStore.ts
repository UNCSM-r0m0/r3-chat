import { create } from 'zustand';
import { apiService } from '../services/api';
import { socketService } from '../services/socketService';
import type { ChatState, Chat, ChatMessage } from '../types';

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
    // Socket.io actions
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
    error: null,
    isStreaming: false,
    isLimitReached: false,

    // Actions
    loadChats: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await apiService.getChats();

            if (response.success) {
                try { console.debug('[loadChats] success:', Array.isArray(response.data) ? response.data.length : response); } catch {}
                set({
                    chats: response.data || [],
                    isLoading: false,
                    error: null
                });
            } else {
                try { console.warn('[loadChats] backend returned success=false:', response); } catch {}
                set({
                    isLoading: false,
                    error: response.message || 'Error al cargar chats'
                });
            }
        } catch (error: any) {
            try { console.error('[loadChats] request error:', error?.response?.status, error?.response?.data || error?.message || error); } catch {}
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Error al cargar chats'
            });
        }
    },

    createChat: async (title: string, model: string) => {
        try {
            set({ isLoading: true, error: null });
            const response = await apiService.createChat(title, model);

            if (response.success) {
                const newChat = response.data;
                set((state) => ({
                    chats: [newChat, ...state.chats],
                    currentChat: newChat,
                    isLoading: false,
                    error: null,
                }));
                return newChat;
            } else {
                set({
                    isLoading: false,
                    error: response.message || 'Error al crear chat'
                });
                return null;
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Error al crear chat'
            });
            return null;
        }
    },

    selectChat: async (chat: Chat | null) => {
        if (!chat) {
            set({ currentChat: null });
            return;
        }

        try {
            set({ isLoading: true, error: null });

            // Si el chat ya tiene mensajes, usarlo directamente
            if (chat.messages && chat.messages.length > 0) {
                set({
                    currentChat: chat,
                    isLoading: false,
                    error: null
                });
                return;
            }

            // Solo cargar del backend si no tiene mensajes
            const response = await apiService.getChat(chat.id);

            if (response.success) {
                const updatedChat = response.data;
                set({
                    currentChat: updatedChat,
                    chats: get().chats.map(c =>
                        c.id === chat.id ? updatedChat : c
                    ),
                    isLoading: false,
                    error: null
                });
            } else {
                // Si falla la carga del backend, usar el chat local como fallback
                console.warn('Error cargando chat del backend, usando datos locales:', response.message);
                set({
                    currentChat: chat,
                    isLoading: false,
                    error: null
                });
            }
        } catch (error: any) {
            console.error('Error en selectChat:', error);
            // Fallback: usar el chat local si falla la carga
            set({
                currentChat: chat,
                isLoading: false,
                error: null
            });
        }
    },

    sendMessage: async (message: string, model: string) => {
        const { currentChat } = get();

        try {
            // 1. Agregar mensaje del usuario inmediatamente (como ChatGPT5)
            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                chatId: currentChat?.id || '',
                role: 'user',
                content: message,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // 2. Crear mensaje temporal para streaming
            const streamingMessage: ChatMessage = {
                id: `stream-${Date.now()}`,
                chatId: currentChat?.id || '',
                role: 'assistant',
                content: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Actualizar el chat con ambos mensajes
            set((state) => {
                if (!state.currentChat) return state;

                const updatedChat = {
                    ...state.currentChat,
                    messages: [...(Array.isArray(state.currentChat.messages) ? state.currentChat.messages : []), userMessage, streamingMessage],
                };

                return {
                    currentChat: updatedChat,
                    chats: state.chats.map(c =>
                        c.id === state.currentChat?.id ? updatedChat : c
                    ),
                    isStreaming: true,
                    error: null,
                };
            });

            // 3. Iniciar streaming via Socket.io
            try {
                await socketService.sendMessage({
                    message,
                    chatId: currentChat?.id || 'default',
                    model,
                });
            } catch (error: any) {
                console.error('Error enviando mensaje via Socket.io:', error);
                // Fallback: mostrar error en el mensaje de assistant
                set((state) => {
                    if (!state.currentChat) return state;

                    const updatedMessages = state.currentChat.messages.map(msg => {
                        if (msg.id === streamingMessage.id) {
                            return {
                                ...msg,
                                content: 'Error al conectar con el servidor. Verifica tu conexión.',
                                id: `assistant-${Date.now()}`,
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
                        error: 'Error de conexión. Intenta nuevamente.',
                    };
                });
            }
        } catch (error: any) {
            console.error('Error sending message:', error);

            let errorMessage = 'Error al enviar mensaje';
            let isLimitReached = false;

            if (error.response?.data) {
                const { message, errorCode } = error.response.data;

                // Manejar errores específicos del backend
                switch (errorCode) {
                    case 'AI_QUOTA_EXCEEDED':
                        errorMessage = 'Límite de cuota excedido. Por favor, intenta con otro modelo.';
                        break;
                    case 'AI_CONFIG_ERROR':
                        errorMessage = 'El modelo no está configurado correctamente.';
                        break;
                    case 'AI_SERVICE_UNAVAILABLE':
                        errorMessage = 'El modelo no está disponible. Por favor, intenta con otro modelo.';
                        break;
                    case 'HTTP_EXCEPTION':
                        errorMessage = message || 'Error de validación';
                        break;
                    default:
                        errorMessage = message || errorMessage;
                }
            } else if (error.response?.status === 403) {
                // Detectar si es un error de límite de mensajes
                if (error.response?.data?.message?.includes('límite') ||
                    error.response?.data?.message?.includes('Has alcanzado')) {
                    isLimitReached = true;
                    errorMessage = 'Has alcanzado tu límite de mensajes por día.';
                } else {
                    errorMessage = 'Acceso denegado.';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            set({
                isStreaming: false,
                error: errorMessage,
                isLimitReached
            });
        }
    },

    // Funciones para Socket.io
    initializeSocket: () => {
        // console.log('Inicializando Socket.io...');
        socketService.connect();

        // Configurar listeners para respuestas
        socketService.onResponseStart((data) => {
            // console.log('📥 Respuesta iniciada:', data.content);
            const { currentChat } = get();

            if (currentChat) {
                // Actualizar el último mensaje de assistant con "pensando..."
                set((state) => {
                    if (!state.currentChat) return state;

                    const updatedMessages = state.currentChat.messages.map(msg => {
                        if (msg.id.startsWith('stream-')) {
                            return { ...msg, content: data.content };
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
            }
        });

        socketService.onResponseChunk((data) => {
            // console.log('📥 Chunk recibido:', data.content);
            const { currentChat } = get();

            if (currentChat) {
                // Concatenar chunk al último mensaje de assistant
                set((state) => {
                    if (!state.currentChat) return state;

                    const updatedMessages = state.currentChat.messages.map(msg => {
                        if (msg.id.startsWith('stream-')) {
                            return { ...msg, content: msg.content + data.content };
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
            }
        });

        socketService.onResponseEnd((data) => {
            // console.log('📥 Respuesta completada:', data.fullContent);
            const { currentChat } = get();

            if (currentChat) {
                // Finalizar el mensaje de assistant
                set((state) => {
                    if (!state.currentChat) return state;

                    const updatedMessages = state.currentChat.messages.map(msg => {
                        if (msg.id.startsWith('stream-')) {
                            return {
                                ...msg,
                                content: data.fullContent,
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
            }
        });

        socketService.onError((error) => {
            console.error('❌ Error de Socket.io:', error);
            set({
                isStreaming: false,
                error: `Error de conexión: ${error}`,
            });
        });
    },

    disconnectSocket: () => {
        // console.log('Desconectando Socket.io...');
        socketService.removeAllListeners();
        socketService.disconnect();
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
            } else {
                set({
                    isLoading: false,
                    error: response.message || 'Error al actualizar chat'
                });
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Error al actualizar chat'
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
            } else {
                set({
                    isLoading: false,
                    error: response.message || 'Error al eliminar chat'
                });
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Error al eliminar chat'
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

