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
    }

    connect(): void {
        if (this.socket?.connected) {
            console.log('Socket ya está conectado');
            return;
        }

        console.log('Conectando a Socket.io server:', this.serverUrl);

        this.socket = io(`${this.serverUrl}/chat`, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            forceNew: true,
            auth: {
                token: localStorage.getItem('access_token') || undefined,
            },
            query: {
                token: localStorage.getItem('access_token') || undefined,
            },
        });

        this.socket.on('connect', () => {
            console.log('✅ Conectado al servidor Socket.io:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Desconectado del servidor:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Error de conexión Socket.io:', error);
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

            // Timeout de 30 segundos para la respuesta
            this.socket.timeout(30000).emit('sendMessage', data, (response: any) => {
                if (response?.status === 'ok') {
                    console.log('✅ Mensaje enviado correctamente');
                    resolve();
                } else {
                    console.error('❌ Error en respuesta del servidor:', response);
                    reject(new Error(response?.error || 'Error del servidor'));
                }
            });
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
