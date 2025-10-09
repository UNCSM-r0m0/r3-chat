/**
 * Sistema de recuperación de passphrase usando Google Auth
 * Permite vincular la passphrase con la cuenta de Google para recuperación
 */

import { encryptJSON, decryptJSON } from './cryptoLocal';

interface RecoveryData {
    userId: string;
    encryptedPassphrase: string;
    timestamp: number;
}

const RECOVERY_KEY = 'passphrase-recovery';

export class PassphraseRecoveryManager {
    /**
     * Guarda la passphrase cifrada vinculada a la cuenta de Google
     */
    static async saveRecoveryData(userId: string, passphrase: string): Promise<void> {
        try {
            // Crear una clave de recuperación basada en el userId
            const recoveryKey = await this.generateRecoveryKey(userId);

            // Cifrar la passphrase con la clave de recuperación
            const encryptedPassphrase = await encryptJSON(
                { passphrase, timestamp: Date.now() },
                recoveryKey
            );

            const recoveryData: RecoveryData = {
                userId,
                encryptedPassphrase: JSON.stringify(encryptedPassphrase),
                timestamp: Date.now(),
            };

            // Guardar en localStorage (esto se puede mejorar con IndexedDB)
            localStorage.setItem(RECOVERY_KEY, JSON.stringify(recoveryData));

            console.log('🔐 Datos de recuperación guardados para usuario:', userId);
        } catch (error) {
            console.error('Error guardando datos de recuperación:', error);
        }
    }

    /**
     * Recupera la passphrase usando la cuenta de Google
     */
    static async recoverPassphrase(userId: string): Promise<string | null> {
        try {
            const recoveryDataStr = localStorage.getItem(RECOVERY_KEY);
            if (!recoveryDataStr) {
                console.log('No hay datos de recuperación disponibles');
                return null;
            }

            const recoveryData: RecoveryData = JSON.parse(recoveryDataStr);

            // Verificar que es para el usuario correcto
            if (recoveryData.userId !== userId) {
                console.log('Los datos de recuperación no coinciden con el usuario actual');
                return null;
            }

            // Verificar que no sean muy antiguos (máximo 30 días)
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
            if (Date.now() - recoveryData.timestamp > maxAge) {
                console.log('Los datos de recuperación han expirado');
                this.clearRecoveryData();
                return null;
            }

            // Generar la clave de recuperación
            const recoveryKey = await this.generateRecoveryKey(userId);

            // Descifrar la passphrase
            const encryptedData = JSON.parse(recoveryData.encryptedPassphrase);
            const decryptedData = await decryptJSON(encryptedData, recoveryKey);

            return decryptedData.passphrase;
        } catch (error) {
            console.error('Error recuperando passphrase:', error);
            return null;
        }
    }

    /**
     * Genera una clave de recuperación basada en el userId
     * Esta es una implementación simple que se puede mejorar
     */
    private static async generateRecoveryKey(userId: string): Promise<string> {
        // En una implementación real, esto debería usar una clave derivada
        // de datos específicos del usuario que solo el servidor conozca
        const encoder = new TextEncoder();
        const data = encoder.encode(`recovery-${userId}-${window.location.hostname}`);

        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    }

    /**
     * Limpia los datos de recuperación
     */
    static clearRecoveryData(): void {
        localStorage.removeItem(RECOVERY_KEY);
        console.log('🔐 Datos de recuperación eliminados');
    }

    /**
     * Verifica si hay datos de recuperación disponibles para un usuario
     */
    static hasRecoveryData(userId: string): boolean {
        try {
            const recoveryDataStr = localStorage.getItem(RECOVERY_KEY);
            if (!recoveryDataStr) return false;

            const recoveryData: RecoveryData = JSON.parse(recoveryDataStr);

            // Verificar que es para el usuario correcto y no ha expirado
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
            return recoveryData.userId === userId &&
                (Date.now() - recoveryData.timestamp) <= maxAge;
        } catch {
            return false;
        }
    }

    /**
     * Actualiza los datos de recuperación cuando se cambia la passphrase
     */
    static async updateRecoveryData(userId: string, newPassphrase: string): Promise<void> {
        await this.saveRecoveryData(userId, newPassphrase);
    }
}
