import { useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useModelStore } from '../stores/modelStore';

export const useChat = () => {
    const {
        chats,
        currentChat,
        isLoading,
        isSelectingChat,
        error,
        isStreaming,
        isLimitReached,
        mode,
        loadChats,
        createChat,
        selectChat,
        sendMessage,
        updateChat,
        deleteChat,
        clearError,
        initializeSocket,
        disconnectSocket,
    } = useChatStore();

    const { selectedModel } = useModelStore();

    // Nota: carga de chats y ciclo de vida del socket se manejan
    // desde un único punto (rutas protegidas) para evitar duplicados.

    // Función para iniciar un nuevo chat
    const startNewChat = useCallback(async (initialMessage?: string) => {
        if (!selectedModel) {
            console.error('No hay modelo seleccionado');
            return null;
        }

        const title = initialMessage
            ? initialMessage.slice(0, 50) + (initialMessage.length > 50 ? '...' : '')
            : 'Nuevo Chat';

        const newChat = await createChat(title, selectedModel.id);

        if (newChat && initialMessage) {
            // Usar el sendMessage del store directamente para mantener el flujo ChatGPT5
            await sendMessage(initialMessage, selectedModel.id);
        }

        return newChat;
    }, [selectedModel, createChat, sendMessage]);

    // Función para enviar mensaje
    const handleSendMessage = useCallback(async (message: string, modelId?: string, fileIds?: string[]) => {
        const modelToUse = modelId || selectedModel?.id;
        if (!modelToUse) {
            console.error('No hay modelo seleccionado');
            return;
        }

        if (!currentChat) {
            // Permitir que el backend cree la conversación al primer envío
            await sendMessage(message, modelToUse, fileIds, mode);
        } else {
            // Validar que el id del chat sea un UUID real
            const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidV4Regex.test(currentChat.id)) {
                // Re-fetch del chat seleccionado para obtener el UUID real
                await selectChat(currentChat);
            }
            await sendMessage(message, modelToUse, fileIds, mode);
        }
    }, [selectedModel, currentChat, sendMessage, selectChat, mode]);

    // Función para actualizar título del chat
    const updateChatTitle = useCallback(async (chatId: string, title: string) => {
        await updateChat(chatId, { title });
    }, [updateChat]);

    // Función para eliminar chat
    const handleDeleteChat = useCallback(async (chatId: string) => {
        await deleteChat(chatId);
        if (currentChat?.id === chatId) {
            await selectChat(null);
        }
    }, [deleteChat, currentChat, selectChat]);

    return {
        chats,
        currentChat,
        isLoading,
        isSelectingChat,
        error,
        isStreaming,
        isLimitReached,
        loadChats,
        startNewChat,
        selectChat,
        sendMessage: handleSendMessage,
        updateChatTitle,
        deleteChat: handleDeleteChat,
        clearError,
        initializeSocket,
        disconnectSocket,
    };
};
