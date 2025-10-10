import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiService } from '../services/api';
import { secureStorageManager } from '../utils/secureStorage';
import type { ChatState, Chat, ChatMessage, ChatRequest } from '../types';

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
    // Streaming actions
    updateStreamingMessage: (content: string) => void;
    completeStreamingMessage: (content: string) => void;
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
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
                        set({
                            chats: response.data || [],
                            isLoading: false,
                            error: null
                        });
                    } else {
                        set({
                            isLoading: false,
                            error: response.message || 'Error al cargar chats'
                        });
                    }
                } catch (error: any) {
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
                            messages: [...state.currentChat.messages, userMessage, streamingMessage],
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

                    // 3. Iniciar streaming
                    const chatRequest: ChatRequest = {
                        message,
                        model,
                        chatId: currentChat?.id,
                    };

                    // Simular streaming para desarrollo (reemplazar con API real)
                    await simulateStreaming(streamingMessage.id, chatRequest);
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
                        messages: [...state.currentChat.messages, message],
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
        }),
        {
            name: 'chat-storage',
            storage: createJSONStorage(() => {
                // Usar storage cifrado si hay datos cifrados o passphrase configurada
                return secureStorageManager.hasEncryptedData() || secureStorageManager.hasPassphrase()
                    ? secureStorageManager.getStorage()
                    : {
                        getItem: async (name: string) => localStorage.getItem(name),
                        setItem: async (name: string, value: string) => localStorage.setItem(name, value),
                        removeItem: async (name: string) => localStorage.removeItem(name),
                    };
            }),
            partialize: (state) => ({
                chats: state.chats,
                currentChat: state.currentChat,
            }),
        }
    )
);

// Función para simular streaming (reemplazar con API real)
const simulateStreaming = async (_streamingMessageId: string, chatRequest: ChatRequest) => {
    const { updateStreamingMessage, completeStreamingMessage } = useChatStore.getState();

    // Respuesta de ejemplo que se va a "escribir" gradualmente
    const sampleResponse = `¡Hola! Soy tu asistente de IA. Veo que me has preguntado sobre "${chatRequest.message}".

Esta es una respuesta simulada que se está escribiendo en tiempo real para demostrar el efecto de streaming. Puedo ayudarte con:

- **Matemáticas y cálculos**: Resolver ecuaciones, integrales, derivadas
- **Programación**: Código en Python, JavaScript, TypeScript, etc.
- **Análisis de datos**: Estadísticas, visualizaciones, machine learning
- **Física**: Mecánica, termodinámica, electromagnetismo
- **Y mucho más...**

¿En qué más puedo ayudarte hoy?`;

    // Simular streaming palabra por palabra
    const words = sampleResponse.split(' ');
    let currentContent = '';

    for (let i = 0; i < words.length; i++) {
        currentContent += (i > 0 ? ' ' : '') + words[i];
        updateStreamingMessage(currentContent);

        // Simular delay variable entre palabras
        const delay = Math.random() * 100 + 50; // 50-150ms
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Completar el streaming
    completeStreamingMessage(currentContent);
};
