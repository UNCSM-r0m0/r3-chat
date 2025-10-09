/**
 * Hook para gestionar el cifrado local de datos sensibles
 * Maneja la passphrase y el estado de cifrado
 */

import { useState, useEffect, useCallback } from 'react';
import { secureStorageManager } from '../utils/secureStorage';

interface UseSecureStorageReturn {
    hasPassphrase: boolean;
    isEncryptionEnabled: boolean;
    setPassphrase: (passphrase: string) => void;
    clearPassphrase: () => void;
    checkEncryptionStatus: () => boolean;
}

export const useSecureStorage = (): UseSecureStorageReturn => {
    const [hasPassphrase, setHasPassphrase] = useState(false);
    const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);

    // Verificar si hay datos cifrados en localStorage
    const checkEncryptionStatus = useCallback((): boolean => {
        const chatStorage = localStorage.getItem('chat-storage');
        const modelStorage = localStorage.getItem('model-storage');

        // Verificar si al menos uno de los storages está cifrado
        const hasEncryptedData = Boolean(
            (chatStorage && chatStorage.includes('"v":1')) ||
            (modelStorage && modelStorage.includes('"v":1'))
        );

        setIsEncryptionEnabled(hasEncryptedData);
        return hasEncryptedData;
    }, []);

    // Establecer passphrase
    const setPassphrase = useCallback((passphrase: string) => {
        secureStorageManager.setPassphrase(passphrase);
        setHasPassphrase(true);
        setIsEncryptionEnabled(true);
    }, []);

    // Limpiar passphrase
    const clearPassphrase = useCallback(() => {
        secureStorageManager.clearPassphrase();
        setHasPassphrase(false);
        setIsEncryptionEnabled(false);
    }, []);

    // Verificar estado al montar
    useEffect(() => {
        const hasEncrypted = checkEncryptionStatus();
        setHasPassphrase(secureStorageManager.hasPassphrase());
        setIsEncryptionEnabled(hasEncrypted);
    }, [checkEncryptionStatus]);

    return {
        hasPassphrase,
        isEncryptionEnabled,
        setPassphrase,
        clearPassphrase,
        checkEncryptionStatus,
    };
};
