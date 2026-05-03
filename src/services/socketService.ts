import { API_BASE_URL } from '../constants';

interface SocketService {
    ws: WebSocket | null;
    connect: () => void;
    disconnect: () => void;
    sendMessage: (data: {
        message: string;
        chatId: string;
        model: string;
        fileIds?: string[];
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

// Backend message shape (snake_case)
type WsInboundMessage =
    | { type: 'chunk'; message_id?: string; content?: string; done?: boolean }
    | { type: 'done'; message_id?: string; done: true; tokens_used?: number }
    | { type: 'error'; error: string }
    | { type: 'pong' };

class SocketServiceImpl implements SocketService {
    public ws: WebSocket | null = null;
    private wsUrl: string;
    private disconnectedCallbacks = new Set<(reason: string) => void>();
    private reconnectedCallbacks = new Set<() => void>();
    private responseStartCallbacks = new Set<(data: { chatId?: string; messageId?: string; content: string }) => void>();
    private responseChunkCallbacks = new Set<(data: { chatId?: string; conversationId?: string; messageId?: string; seq?: number; content: string }) => void>();
    private responseEndCallbacks = new Set<(data: { chatId?: string; conversationId?: string; messageId?: string; fullContent: string; finished?: boolean }) => void>();
    private errorCallbacks = new Set<(error: unknown) => void>();
    private subscriptionCallbacks = new Set<(data: unknown) => void>();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelayMs = 1000;
    private hasEmittedStart = false;
    private currentMessageId: string | null = null;
    private chunkSeq = 0;
    private accumulatedContent = '';

    constructor() {
        const base = API_BASE_URL.replace(/^http/, 'ws');
        this.wsUrl = `${base}/agent/ws`;
    }

    connect(): void {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.reconnectedCallbacks.forEach((cb) => {
                try { cb(); } catch { /* noop */ }
            });
        };

        this.ws.onmessage = (event) => {
            let msg: WsInboundMessage;
            try {
                msg = JSON.parse(event.data);
            } catch {
                console.error('[ws] invalid JSON:', event.data);
                return;
            }

            if (msg.type === 'chunk') {
                const content = msg.content ?? '';
                const messageId = msg.message_id || this.currentMessageId || '';
                if (!this.currentMessageId) {
                    this.currentMessageId = messageId;
                }

                if (!this.hasEmittedStart) {
                    this.hasEmittedStart = true;
                    this.responseStartCallbacks.forEach((cb) => {
                        try { cb({ messageId, content }); } catch { /* noop */ }
                    });
                }

                this.accumulatedContent += content;
                this.chunkSeq += 1;
                this.responseChunkCallbacks.forEach((cb) => {
                    try { cb({ messageId, seq: this.chunkSeq, content }); } catch { /* noop */ }
                });

                if (msg.done) {
                    this.finalizeStream(messageId);
                }
                return;
            }

            if (msg.type === 'done') {
                const messageId = msg.message_id || this.currentMessageId || '';
                this.finalizeStream(messageId);
                return;
            }

            if (msg.type === 'error') {
                this.hasEmittedStart = false;
                this.currentMessageId = null;
                this.errorCallbacks.forEach((cb) => {
                    try { cb({ code: 'STREAM_ERROR', message: msg.error }); } catch { /* noop */ }
                });
                return;
            }

            if (msg.type === 'pong') {
                // keep-alive, ignore
            }
        };

        this.ws.onclose = (event) => {
            this.hasEmittedStart = false;
            this.currentMessageId = null;
            this.ws = null;

            this.disconnectedCallbacks.forEach((cb) => {
                try { cb(event.reason || 'closed'); } catch { /* noop */ }
            });

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts += 1;
                const delay = this.reconnectDelayMs * this.reconnectAttempts;
                setTimeout(() => this.connect(), delay);
            }
        };

        this.ws.onerror = () => {
            if (!this.hasEmittedStart && !this.currentMessageId) {
                return;
            }
            this.errorCallbacks.forEach((cb) => {
                try { cb({ code: 'CONNECTION_ERROR', message: 'WebSocket connection error' }); } catch { /* noop */ }
            });
        };
    }

    private finalizeStream(messageId: string): void {
        this.hasEmittedStart = false;
        this.currentMessageId = null;
        this.responseEndCallbacks.forEach((cb) => {
            try { cb({ messageId, fullContent: this.accumulatedContent, finished: true }); } catch { /* noop */ }
        });
        this.accumulatedContent = '';
        this.chunkSeq = 0;
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    sendMessage(data: {
        message: string;
        chatId: string;
        model: string;
        fileIds?: string[];
    }): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                this.connect();
                setTimeout(() => {
                    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
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
        data: { message: string; chatId: string; model: string; fileIds?: string[] },
        resolve: () => void,
        reject: (reason: Error) => void,
    ): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return reject(new Error('Socket no conectado'));
        }

        const chatId = data.chatId;
        let settled = false;

        const cleanup = () => {
            clearTimeout(failTimer);
            this.responseStartCallbacks.delete(onStart);
            this.errorCallbacks.delete(onError);
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

        const onError = (error: unknown) => {
            const evt = error as { chatId?: string; message?: string; code?: string } | undefined;
            if (evt?.chatId && evt.chatId !== chatId) return;
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error(evt?.message || 'Error en el stream'));
        };

        this.responseStartCallbacks.add(onStart);
        this.errorCallbacks.add(onError);

        const payload: Record<string, unknown> = {
            type: 'chat',
            content: data.message,
            conversation_id: data.chatId || undefined,
            model: data.model,
        };
        if (data.fileIds && data.fileIds.length > 0) {
            payload.file_ids = data.fileIds;
        }

        this.ws.send(JSON.stringify(payload));
    }

    onResponseStart(callback: (data: { chatId?: string; messageId?: string; content: string }) => void): void {
        this.responseStartCallbacks.add(callback);
    }

    onResponseChunk(callback: (data: { chatId?: string; conversationId?: string; messageId?: string; seq?: number; content: string }) => void): void {
        this.responseChunkCallbacks.add(callback);
    }

    onResponseEnd(callback: (data: { chatId?: string; conversationId?: string; messageId?: string; fullContent: string; finished?: boolean }) => void): void {
        this.responseEndCallbacks.add(callback);
    }

    onError(callback: (error: unknown) => void): void {
        this.errorCallbacks.add(callback);
    }

    onDisconnected(callback: (reason: string) => void): void {
        this.disconnectedCallbacks.add(callback);
    }

    onReconnected(callback: () => void): void {
        this.reconnectedCallbacks.add(callback);
    }

    onSubscriptionUpdated(callback: (data: unknown) => void): void {
        this.subscriptionCallbacks.add(callback);
    }

    offSubscriptionUpdated(callback: (data: unknown) => void): void {
        this.subscriptionCallbacks.delete(callback);
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    removeAllListeners(): void {
        this.responseStartCallbacks.clear();
        this.responseChunkCallbacks.clear();
        this.responseEndCallbacks.clear();
        this.errorCallbacks.clear();
        this.subscriptionCallbacks.clear();
        this.disconnectedCallbacks.clear();
        this.reconnectedCallbacks.clear();
    }
}

export const socketService = new SocketServiceImpl();
