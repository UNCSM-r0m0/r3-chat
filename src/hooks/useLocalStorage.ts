import { useState } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
    // Obtener valor del localStorage o usar valor inicial
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Función para actualizar el valor
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Permitir que el valor sea una función para que tengamos la misma API que useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue] as const;
};
