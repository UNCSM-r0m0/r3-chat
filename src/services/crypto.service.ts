/**
 * 🔐 Servicio de Encriptación End-to-End (E2EE)
 * 
 * Usa Web Crypto API con AES-GCM para encriptación simétrica
 * y ECDH para intercambio de claves.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

export interface EncryptedMessage {
    ciphertext: string;  // base64
    iv: string;          // base64
}

export interface UserKeyPair {
    publicKey: string;   // base64 (JWK)
    privateKey: CryptoKey; // Non-extractable
}

class CryptoService {
    private userKeyPair: UserKeyPair | null = null;
    private conversationKeys = new Map<string, CryptoKey>(); // conversationId -> sharedKey

    /**
     * Genera un par de claves para el usuario
     */
    async generateUserKeyPair(): Promise<UserKeyPair> {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'ECDH',
                namedCurve: 'P-256',
            },
            true, // extractable para exportar publicKey
            ['deriveKey']
        );

        // Exportar clave pública como JWK
        const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
        
        this.userKeyPair = {
            publicKey: JSON.stringify(publicKeyJwk),
            privateKey: keyPair.privateKey,
        };

        return this.userKeyPair;
    }

    /**
     * Obtiene o genera el par de claves del usuario
     */
    async getUserKeyPair(): Promise<UserKeyPair> {
        if (this.userKeyPair) return this.userKeyPair;
        return this.generateUserKeyPair();
    }

    /**
     * Deriva una clave compartida usando la clave pública del otro usuario
     */
    async deriveSharedKey(conversationId: string, otherPublicKeyJwk: string): Promise<CryptoKey> {
        // Verificar si ya tenemos la clave
        if (this.conversationKeys.has(conversationId)) {
            return this.conversationKeys.get(conversationId)!;
        }

        const { privateKey } = await this.getUserKeyPair();
        
        // Importar clave pública del otro usuario
        const publicKeyJwk = JSON.parse(otherPublicKeyJwk);
        const publicKey = await crypto.subtle.importKey(
            'jwk',
            publicKeyJwk,
            { name: 'ECDH', namedCurve: 'P-256' },
            false,
            []
        );

        // Derivar clave compartida
        const sharedKey = await crypto.subtle.deriveKey(
            {
                name: 'ECDH',
                public: publicKey,
            },
            privateKey,
            { name: ALGORITHM, length: KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );

        this.conversationKeys.set(conversationId, sharedKey);
        return sharedKey;
    }

    /**
     * Encripta un mensaje
     */
    async encryptMessage(conversationId: string, plaintext: string, otherPublicKeyJwk: string): Promise<EncryptedMessage> {
        const sharedKey = await this.deriveSharedKey(conversationId, otherPublicKeyJwk);
        
        // Generar IV aleatorio
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        
        // Encriptar
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        
        const ciphertext = await crypto.subtle.encrypt(
            { name: ALGORITHM, iv },
            sharedKey,
            data
        );

        return {
            ciphertext: this.arrayBufferToBase64(ciphertext),
            iv: this.arrayBufferToBase64(iv),
        };
    }

    /**
     * Desencripta un mensaje
     */
    async decryptMessage(conversationId: string, encryptedMessage: EncryptedMessage, otherPublicKeyJwk: string): Promise<string> {
        const sharedKey = await this.deriveSharedKey(conversationId, otherPublicKeyJwk);
        
        const ciphertext = this.base64ToArrayBuffer(encryptedMessage.ciphertext);
        const iv = this.base64ToArrayBuffer(encryptedMessage.iv);
        
        try {
            const decrypted = await crypto.subtle.decrypt(
                { name: ALGORITHM, iv },
                sharedKey,
                ciphertext
            );
            
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('[Crypto] Error desencriptando:', error);
            return '[Mensaje encriptado - no se puede descifrar]';
        }
    }

    /**
     * Limpia las claves de una conversación
     */
    clearConversationKey(conversationId: string): void {
        this.conversationKeys.delete(conversationId);
    }

    /**
     * Limpia todas las claves (logout)
     */
    clearAllKeys(): void {
        this.userKeyPair = null;
        this.conversationKeys.clear();
    }

    // Helpers
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

export const cryptoService = new CryptoService();
export default cryptoService;
