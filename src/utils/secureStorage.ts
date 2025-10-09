/**
 * Storage cifrado para Zustand usando Web Crypto API
 * Permite cifrar/descifrar datos de localStorage de forma transparente
 */

import { encryptJSON, decryptJSON, isEncrypted } from './cryptoLocal';

/**
 * Función para obtener la passphrase actual (debe ser implementada por el usuario)
 */
export type PassphraseProvider = () => string | null;

/**
 * Crea un storage cifrado compatible con Zustand
 */
export function makeEncryptedStorage(getPassphrase: PassphraseProvider) {
    return {
        /**
         * Obtiene un item del storage, descifrándolo si es necesario
         */
        async getItem(name: string): Promise<string | null> {
            const raw = localStorage.getItem(name);
            if (!raw) return null;

            // Si no está cifrado, devolver tal como está (compatibilidad hacia atrás)
            if (!isEncrypted(raw)) {
                return raw;
            }

            const passphrase = getPassphrase();
            if (!passphrase) {
                console.warn(`No hay passphrase disponible para descifrar ${name}`);
                return null;
            }

            try {
                const decrypted = await decryptJSON(raw, passphrase);
                return JSON.stringify(decrypted);
            } catch (error) {
                console.warn(`No se pudo descifrar ${name}:`, error);
                return null;
            }
        },

        /**
         * Guarda un item en el storage, cifrándolo
         */
        async setItem(name: string, value: string): Promise<void> {
            const passphrase = getPassphrase();
            if (!passphrase) {
                console.warn(`No hay passphrase disponible para cifrar ${name}, guardando sin cifrar`);
                localStorage.setItem(name, value);
                return;
            }

            try {
                const parsed = JSON.parse(value);
                const encrypted = await encryptJSON(parsed, passphrase);
                localStorage.setItem(name, encrypted);
            } catch (error) {
                console.error(`Error cifrando ${name}:`, error);
                // Fallback: guardar sin cifrar
                localStorage.setItem(name, value);
            }
        },

        /**
         * Elimina un item del storage
         */
        async removeItem(name: string): Promise<void> {
            localStorage.removeItem(name);
        }
    };
}

/**
 * Storage cifrado con passphrase en memoria
 */
class SecureStorageManager {
    private passphrase: string | null = null;
    private storage: ReturnType<typeof makeEncryptedStorage>;

    constructor() {
        this.storage = makeEncryptedStorage(() => this.passphrase);
    }

    /**
       * Establece la passphrase para cifrado/descifrado
       */
    setPassphrase(passphrase: string | null): void {
        this.passphrase = passphrase;
    }

    /**
       * Obtiene el storage cifrado
       */
    getStorage() {
        return this.storage;
    }

    /**
       * Verifica si hay una passphrase configurada
       */
    hasPassphrase(): boolean {
        return this.passphrase !== null;
    }

    /**
       * Limpia la passphrase de memoria
       */
    clearPassphrase(): void {
        this.passphrase = null;
    }
}

// Instancia global del manager
export const secureStorageManager = new SecureStorageManager();

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
        getStorage: () => secureStorageManager.getStorage(),
        getLocalStorageWrapper: () => localStorageWrapper
    };
}
