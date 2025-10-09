/**
 * Genera un fingerprint único del navegador para usuarios anónimos
 * Basado en características del navegador, resolución, timezone, etc.
 */
export const generateFingerprint = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Información básica del navegador
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset().toString(),
        navigator.platform,
        navigator.cookieEnabled.toString(),
        navigator.doNotTrack || 'unknown',
    ];

    // Canvas fingerprinting
    if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Fingerprint test', 2, 2);
        components.push(canvas.toDataURL());
    }

    // WebGL fingerprinting (si está disponible)
    try {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
                components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
            }
        }
    } catch (e) {
        // Ignorar errores de WebGL
    }

    // Crear hash simple de los componentes
    const combined = components.join('|');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a 32-bit integer
    }

    return `anon_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
};

/**
 * Obtiene o genera un fingerprint persistente para el usuario
 * Se guarda en localStorage para mantener consistencia
 */
export const getOrCreateFingerprint = async (): Promise<string> => {
    const STORAGE_KEY = 'anonymous_fingerprint';

    try {
        // Intentar obtener fingerprint existente
        const existing = localStorage.getItem(STORAGE_KEY);
        if (existing) {
            return existing;
        }

        // Generar nuevo fingerprint
        const fingerprint = await generateFingerprint();
        localStorage.setItem(STORAGE_KEY, fingerprint);
        return fingerprint;
    } catch (error) {
        console.warn('Error generating fingerprint, using fallback:', error);
        // Fallback: usar timestamp + random
        const fallback = `anon_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(STORAGE_KEY, fallback);
        return fallback;
    }
};
