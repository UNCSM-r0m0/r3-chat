import { useState, useEffect } from 'react';
import { getOrCreateFingerprint } from '../utils/fingerprint';

/**
 * Hook para manejar el ID anónimo del usuario
 * Útil para usuarios no registrados
 */
export const useAnonymousId = () => {
    const [anonymousId, setAnonymousId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generateId = async () => {
            try {
                const id = await getOrCreateFingerprint();
                setAnonymousId(id);
            } catch (error) {
                console.error('Error generating anonymous ID:', error);
            } finally {
                setIsLoading(false);
            }
        };

        generateId();
    }, []);

    return {
        anonymousId,
        isLoading,
        regenerateId: async () => {
            setIsLoading(true);
            try {
                const id = await getOrCreateFingerprint();
                setAnonymousId(id);
                return id;
            } catch (error) {
                console.error('Error regenerating anonymous ID:', error);
                return null;
            } finally {
                setIsLoading(false);
            }
        }
    };
};
