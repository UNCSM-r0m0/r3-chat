/**
 * 🔐 Hook para manejo de E2EE en chats
 * 
 * Este hook permite encriptar/desencriptar mensajes.
 * Para chat con AI: marca mensajes sensibles para encriptación local.
 * Para chat usuario-usuario: E2EE completo.
 */

import { useState, useCallback, useEffect } from 'react';
import { cryptoService, EncryptedMessage } from '../services/crypto.service';

interface UseE2EEOptions {
    conversationId: string;
    otherPublicKey?: string; // Clave pública del otro usuario (para chat 1:1)
}

interface UseE2EEReturn {
    isReady: boolean;
    publicKey: string | null;
    encryptMessage: (message: string) => Promise<EncryptedMessage | null>;
    decryptMessage: (encryptedMessage: EncryptedMessage) => Promise<string | null>;
    isSensitiveMode: boolean;
    setSensitiveMode: (enabled: boolean) => void;
}

export function useE2EE({ conversationId, otherPublicKey }: UseE2EEOptions): UseE2EEReturn {
    const [isReady, setIsReady] = useState(false);
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [isSensitiveMode, setSensitiveMode] = useState(false);

    // Inicializar claves
    useEffect(() => {
        const init = async () => {
            try {
                const keyPair = await cryptoService.getUserKeyPair();
                setPublicKey(keyPair.publicKey);
                setIsReady(true);
            } catch (error) {
                console.error('[E2EE] Error inicializando:', error);
            }
        };
        init();
    }, []);

    const encryptMessage = useCallback(async (message: string): Promise<EncryptedMessage | null> => {
        if (!otherPublicKey) {
            // Modo local: encriptar para almacenamiento seguro
            // Por ahora, solo retornamos el mensaje sin encriptar
            // ya que la AI necesita leerlo
            console.log('[E2EE] Modo AI: mensaje no encriptado para procesamiento');
            return null;
        }

        try {
            return await cryptoService.encryptMessage(conversationId, message, otherPublicKey);
        } catch (error) {
            console.error('[E2EE] Error encriptando:', error);
            return null;
        }
    }, [conversationId, otherPublicKey]);

    const decryptMessage = useCallback(async (encryptedMessage: EncryptedMessage): Promise<string | null> => {
        if (!otherPublicKey) {
            console.log('[E2EE] Modo AI: no hay desencriptación necesaria');
            return null;
        }

        try {
            return await cryptoService.decryptMessage(conversationId, encryptedMessage, otherPublicKey);
        } catch (error) {
            console.error('[E2EE] Error desencriptando:', error);
            return null;
        }
    }, [conversationId, otherPublicKey]);

    return {
        isReady,
        publicKey,
        encryptMessage,
        decryptMessage,
        isSensitiveMode,
        setSensitiveMode,
    };
}

export default useE2EE;
