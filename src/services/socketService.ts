import { io, Socket } from 'socket.io-client';
import { API_ORIGIN } from '../constants';

interface SocketService {
    socket: Socket | null;
    connect: () => void;
    disconnect: () => void;
    sendMessage: (data: {
        message: string;
        chatId: string;
        model: string;
    }) => Promise<void>;
    onResponseStart: (callback: (data: { chatId?: string; messageId?: string; content: string }) => void) => void;
    onResponseChunk: (callback: (data: { chatId?: string; conversationId?: string; messageId?: string; seq?: number; content: string }) => void) => void;
    onResponseEnd: (callback: (data: { chatId?: string; conversationId?: string; messageId?: string; fullContent: string; finished?: boolean }) => void) => void;
    onError: (callback: (error: unknown) => void) => void;
    onDisconnected: (callback: (reason: string) => void) => void;
    onReconnected: (callback: () => void) => void;
    onSubscriptionUpdated: (callback: (data: unknown) => void) => void;
    offSubscriptionUpdated: (callback: (data: unknown) => void) => void;
    isConnected: () => boolean;
}

class SocketServiceImpl implements SocketService {
    public socket: Socket | null = null;
    private serverUrl: string;
    private disconnectedCallbacks: Array<(reason: string) => void> = [];
    private reconnectedCallbacks: Array<() => void> = [];
    // Store pending callbacks to register when socket connects
    private pendingListeners: Array<{ event: string; callback: (...args: any[]) => void }> = [];

    constructor() {
        this.serverUrl = API_ORIGIN;
    }

    private registerPendingListeners(): void {
        // Register any pending listeners that were queued before connection
        if (this.socket) {
            for (const { event, callback } of this.pendingListeners) {
                this.socket.on(event, callback);
            }
            this.pendingListeners = [];
        }
    }

    connect(): void {
        if (this.socket && !this.socket.disconnected) {
            return;
        }

        this.socket = io(`${this.serverUrl}/chat`, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: false,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            perMessageDeflate: { threshold: 0 },
            withCredentials: true,
        });

        this.registerPendingListeners();

        this.socket.once('connect', async () => {
            const currentChatId = await this.getCurrentChatId();
            if (currentChatId) {
                this.socket?.emit('joinChat', { chatId: currentChatId });
            }
        });

        this.socket.on('disconnect', (reason) => {
            this.disconnectedCallbacks.forEach((callback) => {
                try {
                    callback(reason);
                } catch {
                    void 0;
                }
            });
        });

        this.socket.on('connect_error', () => {
            // Error handling
        });

        this.socket.io.on('reconnect', () => {
            this.reconnectedCallbacks.forEach((callback) => {
                try {
                    callback();
                } catch {
                    void 0;
                }
            });
        });

        this.socket.on('error', () => {
            // Error handling
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    private async getCurrentChatId(): Promise<string | null> {
        try {
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
        broadcast?: boolean;
    }): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                // Intentar reconectar una vez antes de fallar
                this.connect();
                // Esperar un poco a que se conecte
                setTimeout(() => {
                    if (!this.socket?.connected) {
                        return reject(new Error('Socket no conectado'));
                    }
                    this.doSendMessage(data, resolve, reject);
                }, 800);
                return;
            }
            this.doSendMessage(data, resolve, reject);
        });
    }

    private doSendMessage(
        data: { message: string; chatId: string; model: string; broadcast?: boolean },
        resolve: () => void,
        reject: (reason: Error) => void,
    ): void {
        if (!this.socket?.connected) {
            return reject(new Error('Socket no conectado'));
        }

        const chatId = data.chatId;
        let settled = false;
        const cleanup = () => {
            clearTimeout(failTimer);
            this.socket?.off('responseStart', onStart);
            this.socket?.off('error', onError);
        };
        const failTimer = setTimeout(() => {
            if (!settled) {
                settled = true;
                cleanup();
                reject(new Error('Servidor no responde (timeout)'));
            }
        }, 15000);

        const onStart = (evt: { chatId?: string }) => {
            if (evt?.chatId && evt.chatId !== chatId) return;
            if (settled) return;
            settled = true;
            cleanup();
            resolve();
        };

        const onError = (evt: { chatId?: string; message?: string; code?: string }) => {
            if (evt?.chatId && evt.chatId !== chatId) return;
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error(evt?.message || 'Error en el stream'));
        };

        this.socket.on('responseStart', onStart);
        this.socket.on('error', onError);

        this.socket.emit(
            'sendMessage',
            data,
            (err: unknown, ack?: { status?: string; message?: string }) => {
                if (err) console.log('ACK (con error o timeout, ignorado):', err);
                else console.log('ACK (informativo):', ack);
            }
        );
    }

    onResponseStart(callback: (data: { chatId?: string; messageId?: string; content: string }) => void): void {
        if (this.socket) {
            this.socket.on('responseStart', callback);
        } else {
            this.pendingListeners.push({ event: 'responseStart', callback });
        }
    }

    onResponseChunk(callback: (data: { chatId?: string; conversationId?: string; messageId?: string; seq?: number; content: string }) => void): void {
        if (this.socket) {
            this.socket.on('responseChunk', callback);
        } else {
            this.pendingListeners.push({ event: 'responseChunk', callback });
        }
    }

    onResponseEnd(callback: (data: { chatId?: string; conversationId?: string; messageId?: string; fullContent: string; finished?: boolean }) => void): void {
        if (this.socket) {
            this.socket.on('responseEnd', callback);
        } else {
            this.pendingListeners.push({ event: 'responseEnd', callback });
        }
    }

    onError(callback: (error: unknown) => void): void {
        if (this.socket) {
            this.socket.on('error', callback);
        } else {
            this.pendingListeners.push({ event: 'error', callback });
        }
    }

    onDisconnected(callback: (reason: string) => void): void {
        this.disconnectedCallbacks.push(callback);
    }

    onReconnected(callback: () => void): void {
        this.reconnectedCallbacks.push(callback);
    }

    onSubscriptionUpdated(callback: (data: unknown) => void): void {
        if (this.socket) {
            this.socket.on('subscriptionUpdated', callback);
        }
    }

    offSubscriptionUpdated(callback: (data: unknown) => void): void {
        if (this.socket) {
            this.socket.off('subscriptionUpdated', callback);
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    removeAllListeners(): void {
        if (this.socket) {
            this.socket.removeAllListeners('responseStart');
            this.socket.removeAllListeners('responseChunk');
            this.socket.removeAllListeners('responseEnd');
            this.socket.removeAllListeners('error');
        }
        this.pendingListeners = [];
        this.disconnectedCallbacks = [];
        this.reconnectedCallbacks = [];
    }
}

export const socketService = new SocketServiceImpl();
