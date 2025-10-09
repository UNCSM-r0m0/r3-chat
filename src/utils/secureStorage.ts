/**
 * Sistema de cifrado local mejorado con envelope versionado
 * Basado en recomendaciones de seguridad para aplicaciones web
 */

import type { StateStorage } from 'zustand/middleware';
import { encryptJSON, decryptJSON, isEnvelope, type Envelope } from './cryptoLocal';

// Clave de cifrado (solo en memoria)
let passphrase: string | null = null;
let saltB64: string | null = null; // Reusar misma salt para la clave

// Canal de comunicación entre pestañas
let broadcastChannel: BroadcastChannel | null = null;

export const secureStorageManager = {
    /**
     * Establece la passphrase para cifrado
     */
    setPassphrase(p: string): void {
        passphrase = p;
        // Guardar en sessionStorage para persistir durante la sesión
        try {
            sessionStorage.setItem('r3chat_passphrase_session', 'true');
        } catch (e) {
            // Ignorar errores de sessionStorage
        }
        this.notifyTabs('unlocked');
    },

    /**
     * Limpia la passphrase de memoria
     */
    clearPassphrase(): void {
        passphrase = null;
        saltB64 = null;
        // Limpiar sessionStorage
        try {
            sessionStorage.removeItem('r3chat_passphrase_session');
        } catch (e) {
            // Ignorar errores de sessionStorage
        }
        this.notifyTabs('locked');
    },

    /**
     * Verifica si hay una passphrase configurada
     */
    hasPassphrase(): boolean {
        return passphrase !== null;
    },

    /**
     * Verifica si hay una sesión activa con passphrase
     */
    hasActiveSession(): boolean {
        try {
            return sessionStorage.getItem('r3chat_passphrase_session') === 'true';
        } catch (e) {
            return false;
        }
    },

    /**
     * Marca la sesión como activa sin establecer passphrase
     */
    markSessionActive(): void {
        try {
            sessionStorage.setItem('r3chat_passphrase_session', 'true');
        } catch (e) {
            // Ignorar errores de sessionStorage
        }
    },

    /**
     * Verifica si el storage está desbloqueado
     */
    isUnlocked(): boolean {
        return !!passphrase;
    },

    /**
     * Obtiene el storage cifrado para Zustand
     */
    getStorage(): StateStorage {
        return {
            getItem: async (name: string) => {
                const raw = localStorage.getItem(name);
                if (!raw) return null;

                // Verificar si es un envelope cifrado
                if (!isEnvelope(raw)) {
                    console.warn(`🔒 ${name} no está cifrado, migrando...`);
                    return raw; // Datos sin cifrar, devolver tal cual
                }

                if (!passphrase) {
                    console.warn('🔒 No hay passphrase configurada');
                    return null;
                }

                try {
                    const envelope: Envelope = JSON.parse(raw);
                    const obj = await decryptJSON(envelope, passphrase);

                    // Guardar salt para reusar en siguientes setItem
                    saltB64 = envelope.salt;

                    return JSON.stringify(obj);
                } catch (error) {
                    console.error('🔒 Error al descifrar:', error);
                    return null;
                }
            },

            setItem: async (name: string, value: string) => {
                if (!passphrase) {
                    console.warn('🔒 No hay passphrase configurada');
                    return;
                }

                try {
                    const env = await encryptJSON(JSON.parse(value), passphrase, saltB64 || undefined);
                    localStorage.setItem(name, JSON.stringify(env));

                    // Guardar salt para reusar
                    saltB64 = env.salt;
                } catch (error) {
                    console.error('🔒 Error al cifrar:', error);
                }
            },

            removeItem: (name: string) => {
                localStorage.removeItem(name);
            },
        };
    },

    /**
     * Inicializa el canal de comunicación entre pestañas
     */
    initBroadcastChannel(): void {
        if (typeof window === 'undefined') return;

        broadcastChannel = new BroadcastChannel('secure-storage');

        broadcastChannel.addEventListener('message', (event) => {
            const { type } = event.data;

            if (type === 'unlocked' && !this.isUnlocked()) {
                // Otra pestaña se desbloqueó, pedir passphrase
                this.requestPassphrase();
            } else if (type === 'locked' && this.isUnlocked()) {
                // Otra pestaña se bloqueó, limpiar estado
                this.clearPassphrase();
            }
        });
    },

    /**
     * Notifica a otras pestañas sobre cambios de estado
     */
    notifyTabs(type: 'unlocked' | 'locked'): void {
        if (broadcastChannel) {
            broadcastChannel.postMessage({ type });
        }
    },

    /**
     * Solicita passphrase al usuario (implementar en UI)
     */
    requestPassphrase(): void {
        // Esto se implementará en el componente de UI
        console.log('🔒 Se requiere passphrase para acceder a datos cifrados');
    },

    /**
     * Migra datos sin cifrar a formato cifrado
     */
    async migrateToEncrypted(name: string): Promise<void> {
        if (!passphrase) return;

        const raw = localStorage.getItem(name);
        if (!raw || isEnvelope(raw)) return; // Ya está cifrado o no existe

        try {
            const data = JSON.parse(raw);
            const env = await encryptJSON(data, passphrase, saltB64 || undefined);
            localStorage.setItem(name, JSON.stringify(env));

            // Guardar salt para reusar
            saltB64 = env.salt;

            console.log(`🔒 Migrado ${name} a formato cifrado`);
        } catch (error) {
            console.error(`🔒 Error migrando ${name}:`, error);
        }
    },

    /**
     * Limpia todos los datos cifrados
     */
    clearAllEncrypted(): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value && isEnvelope(value)) {
                localStorage.removeItem(key);
            }
        });

        this.clearPassphrase();
        console.log('🔒 Todos los datos cifrados han sido eliminados');
    },

    /**
     * Verifica si hay datos cifrados en el storage
     */
    hasEncryptedData(): boolean {
        const keys = Object.keys(localStorage);
        return keys.some(key => {
            const value = localStorage.getItem(key);
            return value && isEnvelope(value);
        });
    },
};

/**
 * Wrapper para localStorage que implementa la interfaz StateStorage
 */
const localStorageWrapper = {
    async getItem(name: string): Promise<string | null> {
        return localStorage.getItem(name);
    },
    async setItem(name: string, value: string): Promise<void> {
        localStorage.setItem(name, value);
    },
    async removeItem(name: string): Promise<void> {
        localStorage.removeItem(name);
    }
};

/**
 * Hook para usar el storage cifrado en componentes React
 */
export function useSecureStorage() {
    return {
        setPassphrase: (passphrase: string) => secureStorageManager.setPassphrase(passphrase),
        clearPassphrase: () => secureStorageManager.clearPassphrase(),
        hasPassphrase: () => secureStorageManager.hasPassphrase(),
        isUnlocked: () => secureStorageManager.isUnlocked(),
        getStorage: () => secureStorageManager.getStorage(),
        getLocalStorageWrapper: () => localStorageWrapper,
        initBroadcastChannel: () => secureStorageManager.initBroadcastChannel(),
        hasEncryptedData: () => secureStorageManager.hasEncryptedData(),
        clearAllEncrypted: () => secureStorageManager.clearAllEncrypted(),
    };
}