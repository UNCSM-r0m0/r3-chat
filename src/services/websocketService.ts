/**
 * Servicio de WebSocket nativo para reemplazar Socket.IO
 * Conecta a: wss://api.r0lm0.dev/api/chat/ws
 */

interface WebSocketMessage {
    type: 'message' | 'ping';
    content?: string;
    conversationId?: string;
    model?: string;
    anonymousId?: string;
}

interface WebSocketResponse {
    type: 'chunk' | 'complete' | 'error' | 'pong';
    content?: string;
    conversationId?: string;
    messageId?: string;
    remaining?: number;
    limit?: number;
    tier?: string;
    error?: string;
    data?: any;
}

interface WebSocketService {
    socket: WebSocket | null;
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
    removeAllListeners: () => void;
}

class WebSocketServiceImpl implements WebSocketService {
    public socket: WebSocket | null = null;
    private serverUrl: string;
    private wsUrl: string;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private pingInterval: NodeJS.Timeout | null = null;
    private isManualDisconnect = false;

    // Callbacks
    private responseStartCallbacks: Array<(data: { content: string }) => void> = [];
    private responseChunkCallbacks: Array<(data: { content: string }) => void> = [];
    private responseEndCallbacks: Array<(data: { fullContent: string }) => void> = [];
    private errorCallbacks: Array<(error: string) => void> = [];
    private subscriptionUpdatedCallbacks: Array<(data: any) => void> = [];

    // Estado para manejar streaming
    private currentStreamingContent = '';

    constructor() {
        this.serverUrl = process.env.NODE_ENV === 'production'
            ? 'https://api.r0lm0.dev'
            : 'http://localhost:3000';

        // Construir URL WebSocket
        const wsProtocol = this.serverUrl.startsWith('https') ? 'wss' : 'ws';
        const wsHost = this.serverUrl.replace(/^https?:\/\//, '');
        this.wsUrl = `${wsProtocol}://${wsHost}/api/chat/ws`;
    }

    connect(): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            return;
        }

        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
            return;
        }

        try {
            this.isManualDisconnect = false;
            this.socket = new WebSocket(this.wsUrl);

            this.socket.onopen = () => {
                console.log('✅ WebSocket conectado');
                this.reconnectAttempts = 0;
                this.startPingInterval();
            };

            this.socket.onmessage = (event) => {
                try {
                    const response: WebSocketResponse = JSON.parse(event.data);
                    this.handleMessage(response);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.socket.onerror = (error) => {
                console.error('❌ Error de WebSocket:', error);
                this.notifyError('Error de conexión WebSocket');
            };

            this.socket.onclose = (event) => {
                console.log('❌ WebSocket desconectado', event.code, event.reason);
                this.stopPingInterval();

                // No reconectar si fue desconexión manual o cierre normal
                if (this.isManualDisconnect || event.code === 1000) {
                    return;
                }

                // Intentar reconectar
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    const delay = this.reconnectDelay * this.reconnectAttempts;
                    console.log(`🔄 Reconectando en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

                    this.reconnectTimeout = setTimeout(() => {
                        this.connect();
                    }, delay);
                } else {
                    console.error('❌ Máximo de intentos de reconexión alcanzado');
                    this.notifyError('No se pudo conectar al servidor después de varios intentos');
                }
            };
        } catch (error) {
            console.error('Error al crear WebSocket:', error);
            this.notifyError('Error al crear conexión WebSocket');
        }
    }

    private handleMessage(response: WebSocketResponse): void {
        switch (response.type) {
            case 'chunk':
                // Primer chunk = inicio de respuesta
                if (this.currentStreamingContent === '') {
                    this.currentStreamingContent = response.content || '';
                    this.notifyResponseStart({ content: this.currentStreamingContent });
                } else {
                    // Chunks subsiguientes
                    this.currentStreamingContent += response.content || '';
                    this.notifyResponseChunk({ content: response.content || '' });
                }
                break;

            case 'complete':
                // Respuesta completa
                const fullContent = response.content || this.currentStreamingContent;
                this.notifyResponseEnd({ fullContent });
                this.currentStreamingContent = '';
                break;

            case 'error':
                const errorMessage = response.error || 'Error desconocido';
                this.notifyError(errorMessage);
                this.currentStreamingContent = '';
                break;

            case 'pong':
                // Respuesta a ping, conexión activa
                break;

            default:
                console.warn('Tipo de mensaje desconocido:', response.type);
        }
    }

    disconnect(): void {
        this.isManualDisconnect = true;
        this.stopPingInterval();

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.socket) {
            this.socket.close(1000, 'Desconexión manual');
            this.socket = null;
        }
    }

    private async getAnonymousId(): Promise<string | null> {
        try {
            const { getOrCreateFingerprint } = await import('../utils/fingerprint');
            return await getOrCreateFingerprint();
        } catch (error) {
            console.warn('Error obteniendo anonymousId:', error);
        }
        return null;
    }

    sendMessage(data: {
        message: string;
        chatId: string;
        model: string;
        broadcast?: boolean;
    }): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                return reject(new Error('WebSocket no conectado'));
            }

            // Resetear estado de streaming
            this.currentStreamingContent = '';

            const message: WebSocketMessage = {
                type: 'message',
                content: data.message,
                model: data.model,
            };

            // Agregar conversationId si es un UUID válido
            if (data.chatId) {
                const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (uuidV4Regex.test(data.chatId)) {
                    message.conversationId = data.chatId;
                } else {
                    // Si no es UUID, usar anonymousId
                    const anonymousId = await this.getAnonymousId();
                    if (anonymousId) {
                        message.anonymousId = anonymousId;
                    }
                }
            } else {
                // Si no hay chatId, usar anonymousId
                const anonymousId = await this.getAnonymousId();
                if (anonymousId) {
                    message.anonymousId = anonymousId;
                }
            }

            try {
                this.socket.send(JSON.stringify(message));

                // Esperar a que comience el streaming (primer chunk)
                const timeout = setTimeout(() => {
                    cleanup();
                    reject(new Error('Servidor no responde (timeout)'));
                }, 20000);

                const onStart = (evt: { content: string }) => {
                    if (evt.content) {
                        cleanup();
                        resolve();
                    }
                };

                const cleanup = () => {
                    clearTimeout(timeout);
                    const index = this.responseStartCallbacks.indexOf(onStart);
                    if (index > -1) {
                        this.responseStartCallbacks.splice(index, 1);
                    }
                };

                this.responseStartCallbacks.push(onStart);
            } catch (error) {
                reject(error);
            }
        });
    }

    onResponseStart(callback: (data: { content: string }) => void): void {
        this.responseStartCallbacks.push(callback);
    }

    onResponseChunk(callback: (data: { content: string }) => void): void {
        this.responseChunkCallbacks.push(callback);
    }

    onResponseEnd(callback: (data: { fullContent: string }) => void): void {
        this.responseEndCallbacks.push(callback);
    }

    onError(callback: (error: string) => void): void {
        this.errorCallbacks.push(callback);
    }

    onSubscriptionUpdated(callback: (data: any) => void): void {
        this.subscriptionUpdatedCallbacks.push(callback);
    }

    offSubscriptionUpdated(callback: (data: any) => void): void {
        const index = this.subscriptionUpdatedCallbacks.indexOf(callback);
        if (index > -1) {
            this.subscriptionUpdatedCallbacks.splice(index, 1);
        }
    }

    isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    removeAllListeners(): void {
        this.responseStartCallbacks = [];
        this.responseChunkCallbacks = [];
        this.responseEndCallbacks = [];
        this.errorCallbacks = [];
        this.subscriptionUpdatedCallbacks = [];
    }

    private startPingInterval(): void {
        this.stopPingInterval();
        this.pingInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping' }));
            } else {
                this.stopPingInterval();
            }
        }, 30000); // Ping cada 30 segundos
    }

    private stopPingInterval(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    private notifyResponseStart(data: { content: string }): void {
        this.responseStartCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error en callback responseStart:', error);
            }
        });
    }

    private notifyResponseChunk(data: { content: string }): void {
        this.responseChunkCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error en callback responseChunk:', error);
            }
        });
    }

    private notifyResponseEnd(data: { fullContent: string }): void {
        this.responseEndCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error en callback responseEnd:', error);
            }
        });
    }

    private notifyError(error: string | any): void {
        const errorMessage = typeof error === 'string' ? error : (error?.message || 'Error desconocido');
        this.errorCallbacks.forEach(callback => {
            try {
                callback(errorMessage);
            } catch (err) {
                console.error('Error en callback error:', err);
            }
        });
    }
}

// Singleton instance
export const websocketService = new WebSocketServiceImpl();

