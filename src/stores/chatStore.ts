import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';
import type { ChatState, Chat, ChatMessage, ChatRequest } from '../types';

interface ChatStore extends ChatState {
    // Actions
    loadChats: () => Promise<void>;
    createChat: (title: string, model: string) => Promise<Chat | null>;
    selectChat: (chat: Chat | null) => void;
    sendMessage: (message: string, model: string) => Promise<void>;
    updateChat: (chatId: string, updates: Partial<Chat>) => Promise<void>;
    deleteChat: (chatId: string) => Promise<void>;
    addMessage: (message: ChatMessage) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setStreaming: (streaming: boolean) => void;
    clearError: () => void;
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

            // Actions
            loadChats: async () => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await apiService.getChats();

                    if (response.success) {
                        set({
                            chats: response.data,
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

            selectChat: (chat: Chat | null) => {
                set({ currentChat: chat });
            },

            sendMessage: async (message: string, model: string) => {
                const { currentChat } = get();

                try {
                    set({ isStreaming: true, error: null });

                    const chatRequest: ChatRequest = {
                        message,
                        model,
                        chatId: currentChat?.id,
                    };

                    const response = await apiService.sendMessage(chatRequest);

                    if (response.success) {
                        const { chat } = response.data;

                        // Actualizar el chat actual
                        set((state) => ({
                            currentChat: chat,
                            chats: state.chats.map(c =>
                                c.id === chat.id ? chat : c
                            ),
                            isStreaming: false,
                            error: null,
                        }));
                    } else {
                        set({
                            isStreaming: false,
                            error: response.message || 'Error al enviar mensaje'
                        });
                    }
                } catch (error: any) {
                    set({
                        isStreaming: false,
                        error: error.response?.data?.message || 'Error al enviar mensaje'
                    });
                }
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
                set({ error: null });
            },
        }),
        {
            name: 'chat-storage',
            partialize: (state) => ({
                chats: state.chats,
                currentChat: state.currentChat,
            }),
        }
    )
);
