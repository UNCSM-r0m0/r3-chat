import { io, Socket } from 'socket.io-client';

interface SocketService {
    socket: Socket | null;
    connect: () => void;
    disconnect: () => void;
    sendMessage: (data: {
        message: string;
        chatId: string;
        model: string;
    }) => Promise<void>;
    onResponseStart: (callback: (data: { content: string }) => void) => void;
    onResponseChunk: (callback: (data: { content: string }) => void) => void;
    onResponseEnd: (callback: (data: { fullContent: string }) => void) => void;
    onError: (callback: (error: string) => void) => void;
    onSubscriptionUpdated: (callback: (data: any) => void) => void;
    offSubscriptionUpdated: (callback: (data: any) => void) => void;
    isConnected: () => boolean;
}

class SocketServiceImpl implements SocketService {
    public socket: Socket | null = null;
    private serverUrl: string;

    constructor() {
        // Usar la URL del backend NestJS existente
        this.serverUrl = process.env.NODE_ENV === 'production'
            ? 'https://api.r0lm0.dev'
            : 'http://localhost:3000';

        // console.log('🔗 Server URL configurada:', this.serverUrl);
        // console.log('🔗 NODE_ENV:', process.env.NODE_ENV);
    }

    connect(): void {
        if (this.socket && !this.socket.disconnected) {
            // console.log('Socket ya está conectado o conectando');
            return;
        }

        // console.log('Conectando a Socket.io server:', this.serverUrl);

        // Las cookies HTTP-only se envían automáticamente
        // No necesitamos manejar tokens manualmente
        this.socket = io(`${this.serverUrl}/chat`, {
            transports: ['websocket'],        // Fuerza WS, evita polling
            timeout: 20000,                   // 20s handshake timeout
            forceNew: false,                  // Reusar conexión
            autoConnect: true,
            perMessageDeflate: { threshold: 0 }, // ⚠️ Desactivar compresión (match con server)
            withCredentials: true,            // Incluir cookies HTTP-only
        });

        // Registra listeners una sola vez
        this.socket.once('connect', async () => {
            // console.log('✅ Conectado al servidor Socket.io:', this.socket?.id);
            // Rejoin automático al reconectar
            const currentChatId = await this.getCurrentChatId();
            if (currentChatId) {
                // console.log('🔄 Rejoin automático al chat:', currentChatId);
                this.socket?.emit('joinChat', { chatId: currentChatId });
            }
        });

        this.socket.on('disconnect', (_reason) => {
            // console.log('❌ Desconectado del servidor:', reason);
        });

        this.socket.on('connect_error', (_error) => {
            // console.error('❌ Error de conexión Socket.io:', error);
        });

        this.socket.on('error', (_error) => {
            // console.error('❌ Error del servidor:', error);
        });
    }

    disconnect(): void {
        if (this.socket) {
            // console.log('Desconectando Socket.io...');
            this.socket.disconnect();
            this.socket = null;
        }
    }

    private async getCurrentChatId(): Promise<string | null> {
        // Obtener el chatId actual del store de Zustand
        try {
            // Importar dinámicamente para evitar dependencias circulares
            const { useChatStore } = await import('../stores/chatStore');
            const currentChat = useChatStore.getState().currentChat;
            return currentChat?.id || null;
        } catch (error) {
            console.warn('Error obteniendo chatId actual:', error);
        }
        return null;
    }

    sendMessage(data: {
        message: string;
        chatId: string;
        model: string;
        /** si false, responde solo al emisor; default true */
        broadcast?: boolean;
    }): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                return reject(new Error('Socket no conectado'));
            }

            // console.log('📤 Enviando mensaje via Socket.io:', data.message);

            const chatId = data.chatId;
            let settled = false;
            const cleanup = () => {
                clearTimeout(failTimer);
                this.socket?.off('responseStart', onStart);
            };
            const failTimer = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    cleanup();
                    reject(new Error('Servidor no responde (timeout)')); // nadie arrancó a streamear
                }
            }, 20000);

            const onStart = (evt: { chatId?: string }) => {
                if (evt?.chatId !== chatId) return; // ignora otros chats
                if (settled) return;
                settled = true;
                cleanup();
                resolve(); // éxito: comenzó el stream de ESTA conversación
            };

            this.socket.on('responseStart', onStart);

            // Emitimos SIN depender del timeout de ACK para la UX
            this.socket.emit(
                'sendMessage',
                data,
                (err: any, ack?: { status?: string; message?: string }) => {
                    // Solo log informativo (no afecta UX)
                    if (err) console.log('ACK (con error o timeout, ignorado):', err);
                    else console.log('ACK (informativo):', ack);
                }
            );
        });
    }

    onResponseStart(callback: (data: { content: string }) => void): void {
        if (this.socket) {
            this.socket.on('responseStart', callback);
        }
    }

    onResponseChunk(callback: (data: { content: string }) => void): void {
        if (this.socket) {
            this.socket.on('responseChunk', callback);
        }
    }

    onResponseEnd(callback: (data: { fullContent: string }) => void): void {
        if (this.socket) {
            this.socket.on('responseEnd', callback);
        }
    }

    onError(callback: (error: string) => void): void {
        if (this.socket) {
            this.socket.on('error', callback);
        }
    }

    onSubscriptionUpdated(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('subscriptionUpdated', callback);
        }
    }

    offSubscriptionUpdated(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.off('subscriptionUpdated', callback);
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // Limpiar listeners para evitar memory leaks
    removeAllListeners(): void {
        if (this.socket) {
            this.socket.removeAllListeners('responseStart');
            this.socket.removeAllListeners('responseChunk');
            this.socket.removeAllListeners('responseEnd');
            this.socket.removeAllListeners('error');
        }
    }
}

// Singleton instance
export const socketService = new SocketServiceImpl();
