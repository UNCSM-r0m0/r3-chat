/**
 * Componente de inicialización segura
 * Maneja el gate de inicialización y solicitud de passphrase
 */

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { Lock, Shield, AlertTriangle, CheckCircle, Unlock } from 'lucide-react';
import { secureStorageManager } from '../../utils/secureStorage';
import { verifyPassphrase } from '../../utils/cryptoLocal';
import { useAuth } from '../../hooks/useAuth';

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Verificar estado inicial
  useEffect(() => {
    const checkInitialState = () => {
      // Si aún está cargando la autenticación, esperar
      if (authLoading) {
        return;
      }

      const encrypted = secureStorageManager.hasEncryptedData();
      setHasEncryptedData(encrypted);

      // Si el usuario está autenticado y ya tiene passphrase configurada o sesión activa, continuar
      if (isAuthenticated && (secureStorageManager.hasPassphrase() || secureStorageManager.hasActiveSession())) {
        setIsOpen(false);
        onInitialized();
        return;
      }

      if (encrypted) {
        // Hay datos cifrados, pedir passphrase
        setMode('unlock');
        setIsOpen(true);
      } else {
        // No hay datos cifrados, continuar sin cifrado (no mostrar modal)
        setIsOpen(false);
        onInitialized();
      }
    };

    checkInitialState();
  }, [onInitialized, isAuthenticated, authLoading]);

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
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 mb-6 shadow-lg">
            {mode === 'unlock' ? (
              <Lock className="h-8 w-8 text-white" />
            ) : (
              <Shield className="h-8 w-8 text-white" />
            )}
          </div>
          <div className="mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              R3.chat Security
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {getDescription()}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Ingresa tu passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading && passphrase.trim()) {
                if (mode === 'unlock') {
                  handleUnlock();
                } else if (mode === 'setup' && confirmPassphrase.trim()) {
                  handleSetup();
                }
              }
            }}
            leftIcon={<Lock className="h-4 w-4" />}
            disabled={isLoading}
          />

          {mode === 'setup' && (
            <Input
              type="password"
              placeholder="Confirma tu passphrase"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading && passphrase.trim() && confirmPassphrase.trim()) {
                  handleSetup();
                }
              }}
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
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Información de Seguridad
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Tus datos se cifran localmente con <strong>AES-256-GCM</strong></span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>La passphrase <strong>nunca se almacena</strong></span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Se bloquea automáticamente después de <strong>15 minutos</strong> de inactividad</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Si olvidas la passphrase, puedes <strong>resetear</strong> los datos cifrados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          {mode === 'unlock' && (
            <>
              <Button
                onClick={handleUnlock}
                disabled={isLoading || !passphrase.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Desbloqueando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Unlock className="h-4 w-4" />
                    <span>Desbloquear</span>
                  </div>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="sm:w-auto px-6 py-3 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Resetear</span>
                </div>
              </Button>
            </>
          )}

          {mode === 'setup' && (
            <>
              <Button
                onClick={handleSetup}
                disabled={isLoading || !passphrase.trim() || !confirmPassphrase.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Configurando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Configurar Cifrado</span>
                  </div>
                )}
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="sm:w-auto px-6 py-3 text-gray-600 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <span>Saltar</span>
                </div>
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
