/**
 * Componente de inicialización segura
 * Maneja el gate de inicialización y solicitud de passphrase
 */

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { Lock, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { secureStorageManager } from '../../utils/secureStorage';
import { verifyPassphrase } from '../../utils/cryptoLocal';

interface SecureStorageInitializerProps {
  onInitialized: () => void;
  onError?: (error: string) => void;
}

export const SecureStorageInitializer: React.FC<SecureStorageInitializerProps> = ({
  onInitialized,
  onError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'unlock' | 'setup' | 'migrate'>('unlock');
  const [, setHasEncryptedData] = useState(false);

  // Verificar estado inicial
  useEffect(() => {
    const checkInitialState = () => {
      const encrypted = secureStorageManager.hasEncryptedData();
      setHasEncryptedData(encrypted);

      if (encrypted) {
        // Hay datos cifrados, pedir passphrase
        setMode('unlock');
        setIsOpen(true);
      } else {
        // No hay datos cifrados, ofrecer configuración
        setMode('setup');
        setIsOpen(true);
      }
    };

    checkInitialState();
  }, []);

  const handleUnlock = async () => {
    if (!passphrase.trim()) {
      setError('La passphrase no puede estar vacía');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Intentar desbloquear con la passphrase
      secureStorageManager.setPassphrase(passphrase);
      
      // Verificar que funciona intentando acceder a un dato cifrado
      const keys = Object.keys(localStorage);
      const encryptedKey = keys.find(key => {
        const value = localStorage.getItem(key);
        return value && value.includes('"v":1');
      });

      if (encryptedKey) {
        const value = localStorage.getItem(encryptedKey);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.v === 1) {
              // Verificar con sentinel si es posible
              await verifyPassphrase(value, passphrase);
            }
          } catch (verifyError) {
            // Si la verificación falla, la passphrase es incorrecta
            secureStorageManager.clearPassphrase();
            setError('Passphrase incorrecta');
            return;
          }
        }
      }

      // Éxito
      setIsOpen(false);
      onInitialized();
    } catch (error) {
      secureStorageManager.clearPassphrase();
      setError('Passphrase incorrecta o datos corruptos');
      onError?.(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async () => {
    if (!passphrase.trim()) {
      setError('La passphrase no puede estar vacía');
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setError('Las passphrases no coinciden');
      return;
    }

    if (passphrase.length < 8) {
      setError('La passphrase debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Configurar passphrase
      secureStorageManager.setPassphrase(passphrase);
      
      // Migrar datos existentes si los hay
      const keysToMigrate = ['chat-storage', 'model-storage', 'selected_model'];
      for (const key of keysToMigrate) {
        await secureStorageManager.migrateToEncrypted(key);
      }

      // Éxito
      setIsOpen(false);
      onInitialized();
    } catch (error) {
      secureStorageManager.clearPassphrase();
      setError('Error configurando cifrado');
      onError?.(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Saltar cifrado, usar localStorage normal
    setIsOpen(false);
    onInitialized();
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro? Esto eliminará todos los datos cifrados.')) {
      secureStorageManager.clearAllEncrypted();
      setMode('setup');
      setPassphrase('');
      setConfirmPassphrase('');
      setError(null);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'unlock': return 'Desbloquear Datos Cifrados';
      case 'setup': return 'Configurar Cifrado Local';
      case 'migrate': return 'Migrar a Cifrado';
      default: return 'Configuración de Seguridad';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'unlock': 
        return 'Ingresa tu passphrase para acceder a los datos cifrados.';
      case 'setup': 
        return 'Configura una passphrase para cifrar tus datos localmente.';
      case 'migrate': 
        return 'Migra tus datos existentes a formato cifrado.';
      default: 
        return '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // No permitir cerrar sin completar
      title={getTitle()}
      size="md"
    >
      <div className="space-y-6">
        {/* Icono y descripción */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
            {mode === 'unlock' ? (
              <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            )}
          fabricación
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getDescription()}
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Ingresa tu passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            disabled={isLoading}
          />

          {mode === 'setup' && (
            <Input
              type="password"
              placeholder="Confirma tu passphrase"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              leftIcon={<CheckCircle className="h-4 w-4" />}
              disabled={isLoading}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Información de seguridad */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Información de Seguridad
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Tus datos se cifran localmente con AES-256-GCM</li>
            <li>• La passphrase nunca se almacena</li>
            <li>• Se bloquea automáticamente después de 15 minutos de inactividad</li>
            <li>• Si olvidas la passphrase, perderás acceso a los datos cifrados</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex space-x-3">
          {mode === 'unlock' && (
            <>
              <Button
                onClick={handleUnlock}
                disabled={isLoading || !passphrase.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? 'Desbloqueando...' : 'Desbloquear'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Resetear
              </Button>
            </>
          )}

          {mode === 'setup' && (
            <>
              <Button
                onClick={handleSetup}
                disabled={isLoading || !passphrase.trim() || !confirmPassphrase.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? 'Configurando...' : 'Configurar Cifrado'}
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Saltar
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
