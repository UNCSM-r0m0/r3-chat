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

        console.log('🔗 Server URL configurada:', this.serverUrl);
        console.log('🔗 NODE_ENV:', process.env.NODE_ENV);
    }

    connect(): void {
        if (this.socket?.connected) {
            console.log('Socket ya está conectado');
            return;
        }

        console.log('Conectando a Socket.io server:', this.serverUrl);

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
        console.log('🔑 Token para Socket.io:', token ? 'Presente' : 'Ausente');

        this.socket = io(`${this.serverUrl}/chat`, {
            transports: ['websocket'], // Fuerza WS, evita polling
            timeout: 20000, // 20s timeout
            forceNew: false, // Evita crear socket nuevo en cada render
            autoConnect: true,
            auth: {
                token: token,
            },
            query: {
                token: token,
            },
        });

        // Registra listeners una sola vez
        this.socket.once('connect', () => {
            console.log('✅ Conectado al servidor Socket.io:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Desconectado del servidor:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Error de conexión Socket.io:', error);
        });

        this.socket.on('error', (error) => {
            console.error('❌ Error del servidor:', error);
        });
    }

    disconnect(): void {
        if (this.socket) {
            console.log('Desconectando Socket.io...');
            this.socket.disconnect();
            this.socket = null;
        }
    }

    sendMessage(data: {
        message: string;
        chatId: string;
        model: string;
    }): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Socket no conectado'));
                return;
            }

            console.log('📤 Enviando mensaje via Socket.io:', data.message);

            // Timeout para el ACK
            const ackTimeout = setTimeout(() => {
                reject(new Error('Servidor no responde (timeout)'));
            }, 30000);

            // Escuchar el ACK como evento separado
            const ackListener = (ack: { status: string; message?: string }) => {
                clearTimeout(ackTimeout);
                this.socket?.off('sendMessage', ackListener);

                console.log('✅ ACK recibido:', ack);
                if (ack && ack.status === 'ok') {
                    console.log('✅ Mensaje aceptado, esperando stream...');
                    resolve();
                } else {
                    reject(new Error(ack?.message || 'ACK inválido'));
                }
            };

            this.socket.on('sendMessage', ackListener);
            this.socket.emit('sendMessage', data);
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
