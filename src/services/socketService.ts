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
    isConnected: () => boolean;
}

class SocketServiceImpl implements SocketService {
    public socket: Socket | null = null;
    private serverUrl: string;

    constructor() {
        // Usar la URL del backend NestJS existente
        this.serverUrl = process.env.NODE_ENV === 'production'
            ? 'https://jeanett-uncolorable-pickily.ngrok-free.dev'
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

        // Extraer token del localStorage
        const getToken = () => {
            try {
                const authToken = localStorage.getItem('auth-token');
                if (authToken) {
                    const tokenData = JSON.parse(authToken);
                    // Verificar si el token no ha expirado
                    if (tokenData.expires && Date.now() < tokenData.expires) {
                        return tokenData.token;
                    }
                }
            } catch (error) {
                console.warn('Error al parsear token:', error);
            }
            return undefined;
        };

        const token = getToken();
        // console.log('🔑 Token para Socket.io:', token ? 'Presente' : 'Ausente');

        this.socket = io(`${this.serverUrl}/chat`, {
            transports: ['websocket'],        // Fuerza WS, evita polling
            timeout: 20000,                   // 20s handshake timeout
            forceNew: false,                  // Reusar conexión
            autoConnect: true,
            perMessageDeflate: { threshold: 0 }, // ⚠️ Desactivar compresión (match con server)
            auth: { token },
            query: { token },
        });

        // Registra listeners una sola vez
        this.socket.once('connect', () => {
            // console.log('✅ Conectado al servidor Socket.io:', this.socket?.id);
            // Rejoin automático al reconectar
            const currentChatId = this.getCurrentChatId();
            if (currentChatId) {
                // console.log('🔄 Rejoin automático al chat:', currentChatId);
                this.socket?.emit('joinChat', { chatId: currentChatId });
            }
        });

        this.socket.on('disconnect', (reason) => {
            // console.log('❌ Desconectado del servidor:', reason);
        });

        this.socket.on('connect_error', (error) => {
            // console.error('❌ Error de conexión Socket.io:', error);
        });

        this.socket.on('error', (error) => {
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

    private getCurrentChatId(): string | null {
        // Obtener el chatId actual del store o localStorage
        try {
            const chatData = localStorage.getItem('current-chat');
            if (chatData) {
                const parsed = JSON.parse(chatData);
                return parsed.id || null;
            }
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
