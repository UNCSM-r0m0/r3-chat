/**
 * Sistema de cifrado local mejorado con envelope versionado
 * Basado en recomendaciones de seguridad para aplicaciones web
 */

export type Envelope = {
    v: 1;
    alg: 'AES-GCM';
    kdf: 'PBKDF2-SHA256';
    iter: number;
    salt: string;  // base64
    iv: string;    // base64
    ct: string;    // base64
};

const ITER = 200_000; // Iteraciones PBKDF2 (ajustable según hardware)

export async function deriveKey(pass: string, saltB64?: string, iter = ITER) {
    const te = new TextEncoder();
    const salt = saltB64 ? b64d(saltB64) : crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        te.encode(pass),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: iter,
            hash: 'SHA-256'
        },
        keyMaterial,
        {
            name: 'AES-GCM',
            length: 256
        },
        false,
        ['encrypt', 'decrypt']
    );

    return { key, saltB64: b64e(salt), iter };
}

export async function encryptJSON(obj: any, pass: string, saltB64?: string, iter = ITER): Promise<Envelope> {
    const { key, saltB64: saltOut, iter: it } = await deriveKey(pass, saltB64, iter);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes para AES-GCM

    const data = new TextEncoder().encode(JSON.stringify(obj));
    const ctBuf = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );

    return {
        v: 1,
        alg: 'AES-GCM',
        kdf: 'PBKDF2-SHA256',
        iter: it,
        salt: saltOut,
        iv: b64e(iv),
        ct: b64e(new Uint8Array(ctBuf))
    };
}

export async function decryptJSON(env: Envelope, pass: string) {
    try {
        const { key } = await deriveKey(pass, env.salt, env.iter);
        const pt = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: b64d(env.iv) },
            key,
            b64d(env.ct)
        );
        return JSON.parse(new TextDecoder().decode(pt));
    } catch (error) {
        // Clave incorrecta o datos corruptos
        throw new Error('Clave incorrecta o datos corruptos');
    }
}

// Utilidades de codificación Base64
const b64e = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const b64d = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

// Verificar si un string es un envelope válido
export function isEnvelope(str: string): boolean {
    try {
        const parsed = JSON.parse(str);
        return parsed &&
            typeof parsed === 'object' &&
            parsed.v === 1 &&
            parsed.alg === 'AES-GCM' &&
            parsed.kdf === 'PBKDF2-SHA256' &&
            typeof parsed.iter === 'number' &&
            typeof parsed.salt === 'string' &&
            typeof parsed.iv === 'string' &&
            typeof parsed.ct === 'string';
    } catch {
        return false;
    }
}

// Generar sentinel para verificación rápida de clave
export async function createSentinel(pass: string, saltB64?: string): Promise<string> {
    const sentinel = { timestamp: Date.now(), type: 'sentinel' };
    const envelope = await encryptJSON(sentinel, pass, saltB64);
    return JSON.stringify(envelope);
}

// Verificar clave usando sentinel
export async function verifyPassphrase(sentinelStr: string, pass: string): Promise<boolean> {
    try {
        const envelope: Envelope = JSON.parse(sentinelStr);
        await decryptJSON(envelope, pass);
        return true;
    } catch {
        return false;
    }
}