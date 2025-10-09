/**
 * Utilidades de cifrado local usando Web Crypto API
 * Protege datos sensibles en localStorage contra inspección casual y dispositivos perdidos
 * 
 * IMPORTANTE: No protege contra XSS activo. Para eso necesitas CSP estricta.
 */

/**
 * Deriva una clave de cifrado a partir de una passphrase usando PBKDF2
 */
export async function deriveKey(passphrase: string, saltB64?: string) {
    const enc = new TextEncoder();
    const salt = saltB64
        ? Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))
        : crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100_000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );

    const saltStr = btoa(String.fromCharCode(...salt));
    return { key, saltStr };
}

/**
 * Cifra un objeto JSON usando AES-GCM
 */
export async function encryptJSON(obj: any, passphrase: string): Promise<string> {
    const { key, saltStr } = await deriveKey(passphrase);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(JSON.stringify(obj));

    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );

    const ivStr = btoa(String.fromCharCode(...iv));
    const ctStr = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

    return JSON.stringify({
        v: 1,
        alg: 'AES-GCM',
        salt: saltStr,
        iv: ivStr,
        ct: ctStr
    });
}

/**
 * Descifra un objeto JSON cifrado con AES-GCM
 */
export async function decryptJSON(payload: string, passphrase: string): Promise<any> {
    const parsed = JSON.parse(payload);

    if (parsed.v !== 1 || parsed.alg !== 'AES-GCM') {
        throw new Error('Formato de cifrado no soportado');
    }

    const { key } = await deriveKey(passphrase, parsed.salt);
    const iv = Uint8Array.from(atob(parsed.iv), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(parsed.ct), c => c.charCodeAt(0));

    const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
    );

    const json = new TextDecoder().decode(plaintext);
    return JSON.parse(json);
}

/**
 * Verifica si un string está cifrado (formato esperado)
 */
export function isEncrypted(data: string): boolean {
    try {
        const parsed = JSON.parse(data);
        return parsed.v === 1 && parsed.alg === 'AES-GCM' && parsed.salt && parsed.iv && parsed.ct;
    } catch {
        return false;
    }
}

/**
 * Genera una passphrase aleatoria para casos de uso interno
 */
export function generateRandomPassphrase(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}
