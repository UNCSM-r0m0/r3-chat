/**
 * Hook para manejo de bloqueo por inactividad
 * Implementa timeout automático y sincronización multi-pestaña
 */

import { useEffect, useCallback, useRef } from 'react';
import { secureStorageManager } from '../utils/secureStorage';

interface UseSecureLockOptions {
    timeout?: number; // Tiempo en ms antes de bloquear (default: 15 min)
    onLock?: () => void; // Callback cuando se bloquea
    onUnlock?: () => void; // Callback cuando se desbloquea
}

export function useSecureLock(options: UseSecureLockOptions = {}) {
    const {
        timeout = 15 * 60 * 1000, // 15 minutos por defecto
        onLock,
        onUnlock,
    } = options;

    const timeoutRef = useRef<number | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    // Función para resetear el timer
    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            if (secureStorageManager.isUnlocked()) {
                secureStorageManager.clearPassphrase();
                onLock?.();
                console.log('🔒 Bloqueo automático por inactividad');
            }
        }, timeout);
    }, [timeout, onLock]);

    // Función para bloquear manualmente
    const lock = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        secureStorageManager.clearPassphrase();
        onLock?.();
        console.log('🔒 Bloqueo manual');
    }, [onLock]);

    // Función para desbloquear
    const unlock = useCallback((passphrase: string) => {
        secureStorageManager.setPassphrase(passphrase);
        resetTimer();
        onUnlock?.();
        console.log('🔓 Desbloqueado');
    }, [resetTimer, onUnlock]);

    // Función para verificar si está bloqueado
    const isLocked = useCallback(() => {
        return !secureStorageManager.isUnlocked();
    }, []);

    // Función para obtener tiempo restante antes del bloqueo
    const getTimeRemaining = useCallback(() => {
        if (!secureStorageManager.isUnlocked()) {
            return 0;
        }

        const elapsed = Date.now() - lastActivityRef.current;
        const remaining = timeout - elapsed;
        return Math.max(0, remaining);
    }, [timeout]);

    // Función para obtener tiempo restante en formato legible
    const getTimeRemainingFormatted = useCallback(() => {
        const remaining = getTimeRemaining();
        if (remaining === 0) return 'Bloqueado';

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    }, [getTimeRemaining]);

    // Efectos para manejar eventos de actividad
    useEffect(() => {
        // Inicializar timer
        resetTimer();

        // Eventos que indican actividad del usuario
        const activityEvents = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ];

        const handleActivity = () => {
            if (secureStorageManager.isUnlocked()) {
                resetTimer();
            }
        };

        // Agregar listeners
        activityEvents.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            activityEvents.forEach(event => {
                document.removeEventListener(event, handleActivity, true);
            });
        };
    }, [resetTimer]);

    // Inicializar canal de comunicación entre pestañas
    useEffect(() => {
        secureStorageManager.initBroadcastChannel();
    }, []);

    return {
        lock,
        unlock,
        isLocked,
        getTimeRemaining,
        getTimeRemainingFormatted,
        resetTimer,
    };
}
