import { useEffect, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useModelStore } from '../stores/modelStore';

export const useChat = () => {
    const {
        chats,
        currentChat,
        isLoading,
        error,
        isStreaming,
        loadChats,
        createChat,
        selectChat,
        sendMessage,
        updateChat,
        deleteChat,
        clearError,
    } = useChatStore();

    const { selectedModel } = useModelStore();

    // Cargar chats al montar el componente
    useEffect(() => {
        loadChats();
    }, [loadChats]);

    // Función para iniciar un nuevo chat
    const startNewChat = useCallback(async (initialMessage?: string) => {
        if (!selectedModel) {
            throw new Error('No hay modelo seleccionado');
        }

        const title = initialMessage
            ? initialMessage.slice(0, 50) + (initialMessage.length > 50 ? '...' : '')
            : 'Nuevo Chat';

        const newChat = await createChat(title, selectedModel.id);

        if (newChat && initialMessage) {
            await sendMessage(initialMessage, selectedModel.id);
        }

        return newChat;
    }, [selectedModel, createChat, sendMessage]);

    // Función para enviar mensaje
    const handleSendMessage = useCallback(async (message: string) => {
        if (!selectedModel) {
            throw new Error('No hay modelo seleccionado');
        }

        if (!currentChat) {
            // Crear nuevo chat si no hay uno actual
            await startNewChat(message);
        } else {
            // Enviar mensaje al chat actual
            await sendMessage(message, selectedModel.id);
        }
    }, [selectedModel, currentChat, sendMessage, startNewChat]);

    // Función para actualizar título del chat
    const updateChatTitle = useCallback(async (chatId: string, title: string) => {
        await updateChat(chatId, { title });
    }, [updateChat]);

    // Función para eliminar chat
    const handleDeleteChat = useCallback(async (chatId: string) => {
        await deleteChat(chatId);
        if (currentChat?.id === chatId) {
            selectChat(null);
        }
    }, [deleteChat, currentChat, selectChat]);

    return {
        chats,
        currentChat,
        isLoading,
        error,
        isStreaming,
        startNewChat,
        selectChat,
        sendMessage: handleSendMessage,
        updateChatTitle,
        deleteChat: handleDeleteChat,
        clearError,
    };
};
