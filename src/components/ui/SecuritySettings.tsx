/**
 * Componente para configurar la seguridad local mejorada
 * Permite al usuario habilitar/deshabilitar el cifrado de datos
 */

import React, { useState } from 'react';
import { Shield, Lock, Unlock, AlertCircle, CheckCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { secureStorageManager } from '../../utils/secureStorage';
import { useSecureLock } from '../../hooks/useSecureLock';
import { PassphraseRecoveryManager } from '../../utils/passphraseRecovery';
import { useAuth } from '../../hooks/useAuth';

interface SecuritySettingsProps {
  onClose?: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onClose }) => {
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [showChangePassphraseModal, setShowChangePassphraseModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [currentPassphrase, setCurrentPassphrase] = useState('');
  const [newPassphrase, setNewPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showCurrentPassphrase, setShowCurrentPassphrase] = useState(false);
  const [showNewPassphrase, setShowNewPassphrase] = useState(false);
  const [showConfirmPassphrase, setShowConfirmPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    lock,
    isLocked,
    getTimeRemainingFormatted,
    resetTimer,
  } = useSecureLock({
    onLock: () => {
      console.log('🔒 Datos bloqueados por seguridad');
    },
    onUnlock: () => {
      console.log('🔓 Datos desbloqueados');
    },
  });

  const { user } = useAuth();
  const isEncryptionEnabled = secureStorageManager.hasPassphrase() && !isLocked();
  const hasEncryptedData = secureStorageManager.hasEncryptedData();
  const hasRecoveryData = user?.id ? PassphraseRecoveryManager.hasRecoveryData(user.id) : false;

  const handleEnableEncryption = () => {
    setShowPassphraseModal(true);
  };

  const handleDisableEncryption = () => {
    if (confirm('¿Estás seguro de que quieres deshabilitar el cifrado? Tus datos locales quedarán sin protección.')) {
      secureStorageManager.clearAllEncrypted();
      // Recargar la página para aplicar cambios
      window.location.reload();
    }
  };

  const handlePassphraseConfirm = async (passphrase: string) => {
    secureStorageManager.setPassphrase(passphrase);
    
    // Guardar datos de recuperación si el usuario está autenticado
    if (user?.id) {
      await PassphraseRecoveryManager.saveRecoveryData(user.id, passphrase);
    }
    
    setShowPassphraseModal(false);
    // Recargar la página para aplicar cambios
    window.location.reload();
  };

  const handlePassphraseCancel = () => {
    setShowPassphraseModal(false);
  };

  const handleChangePassphrase = () => {
    setShowChangePassphraseModal(true);
    setError(null);
  };

  const handleChangePassphraseConfirm = async () => {
    if (!currentPassphrase || !newPassphrase || !confirmPassphrase) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (newPassphrase !== confirmPassphrase) {
      setError('Las nuevas passphrases no coinciden');
      return;
    }

    if (newPassphrase.length < 8) {
      setError('La nueva passphrase debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verificar passphrase actual
      if (!secureStorageManager.isUnlocked()) {
        secureStorageManager.setPassphrase(currentPassphrase);
      }

      // Actualizar passphrase
      secureStorageManager.setPassphrase(newPassphrase);
      
      // Actualizar datos de recuperación si el usuario está autenticado
      if (user?.id) {
        await PassphraseRecoveryManager.updateRecoveryData(user.id, newPassphrase);
      }
      
      setShowChangePassphraseModal(false);
      setCurrentPassphrase('');
      setNewPassphrase('');
      setConfirmPassphrase('');
      
      // Recargar para aplicar cambios
      window.location.reload();
    } catch (error) {
      setError('Passphrase actual incorrecta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassphraseCancel = () => {
    setShowChangePassphraseModal(false);
    setCurrentPassphrase('');
    setNewPassphrase('');
    setConfirmPassphrase('');
    setError(null);
  };

  const handleLockNow = () => {
    lock();
  };

  const handleUnlockNow = () => {
    setShowPassphraseModal(true);
  };

  const handleRecoveryAttempt = async () => {
    if (!user?.id) {
      setError('Debes estar autenticado para usar la recuperación');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const recoveredPassphrase = await PassphraseRecoveryManager.recoverPassphrase(user.id);
      
      if (recoveredPassphrase) {
        secureStorageManager.setPassphrase(recoveredPassphrase);
        setShowRecoveryModal(false);
        // Recargar para aplicar cambios
        window.location.reload();
      } else {
        setError('No se encontraron datos de recuperación válidos');
      }
    } catch (error) {
      setError('Error durante la recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración de Seguridad
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Protege tus datos locales con cifrado avanzado
        </p>
      </div>

      {/* Estado actual */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          {isEncryptionEnabled ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-green-700 dark:text-green-400">
                  Cifrado habilitado
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tus datos están protegidos con AES-256-GCM
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Tiempo restante: {getTimeRemainingFormatted()}
                </p>
              </div>
            </>
          ) : hasEncryptedData ? (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  Datos cifrados bloqueados
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ingresa tu passphrase para acceder
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  Cifrado deshabilitado
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tus datos se guardan sin cifrar
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controles de bloqueo/desbloqueo */}
      {hasEncryptedData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            Control de Acceso
          </h3>
          <div className="flex space-x-3">
            {isEncryptionEnabled ? (
              <Button
                onClick={handleLockNow}
                variant="outline"
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                leftIcon={<Lock className="h-4 w-4" />}
              >
                Bloquear Ahora
              </Button>
            ) : (
              <Button
                onClick={handleUnlockNow}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                leftIcon={<Unlock className="h-4 w-4" />}
              >
                Desbloquear
              </Button>
            )}
            <Button
              onClick={resetTimer}
              variant="ghost"
              className="text-gray-600"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Renovar Tiempo
            </Button>
          </div>
          
          {/* Opción de recuperación */}
          {!isEncryptionEnabled && hasRecoveryData && user?.id && (
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                ¿Olvidaste tu passphrase?
              </p>
              <Button
                onClick={() => setShowRecoveryModal(true)}
                variant="outline"
                className="text-green-600 border-green-300 hover:bg-green-50"
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Recuperar con Google
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Información de seguridad */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          ¿Qué protege el cifrado?
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Conversaciones y mensajes del chat</li>
          <li>• Configuraciones de modelos de IA</li>
          <li>• Datos locales en tu dispositivo</li>
          <li>• Acceso casual a localStorage</li>
          <li>• Bloqueo automático por inactividad (15 min)</li>
          <li>• Sincronización multi-pestaña</li>
        </ul>
      </div>

      {/* Limitaciones */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
          Limitaciones
        </h3>
        <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
          <li>• No protege contra XSS activo</li>
          <li>• No protege contra keyloggers</li>
          <li>• No protege contra acceso físico</li>
          <li>• La clave se pierde al cerrar el navegador</li>
          <li>• Si olvidas la passphrase, perderás acceso a los datos</li>
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-3">
        {!hasEncryptedData ? (
          <Button
            onClick={handleEnableEncryption}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            leftIcon={<Lock className="h-4 w-4" />}
          >
            Habilitar Cifrado
          </Button>
        ) : (
          <>
            <Button
              onClick={handleChangePassphrase}
              variant="outline"
              className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Cambiar Passphrase
            </Button>
            <Button
              onClick={handleDisableEncryption}
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              leftIcon={<Unlock className="h-4 w-4" />}
            >
              Deshabilitar
            </Button>
          </>
        )}
        
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            className="px-6"
          >
            Cerrar
          </Button>
        )}
      </div>

      {/* Modal de passphrase inicial */}
      <Modal
        isOpen={showPassphraseModal}
        onClose={handlePassphraseCancel}
        title="Configurar Cifrado Local"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configura una passphrase para proteger tus datos locales. Esta clave solo se usa en tu dispositivo.
          </p>
          <Input
            type="password"
            placeholder="Ingresa tu passphrase"
            value={currentPassphrase}
            onChange={(e) => setCurrentPassphrase(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
          />
          <div className="flex space-x-3">
            <Button
              onClick={() => handlePassphraseConfirm(currentPassphrase)}
              disabled={!currentPassphrase.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Configurar
            </Button>
            <Button
              onClick={handlePassphraseCancel}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de cambio de passphrase */}
      <Modal
        isOpen={showChangePassphraseModal}
        onClose={handleChangePassphraseCancel}
        title="Cambiar Passphrase"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu passphrase actual y configura una nueva.
          </p>
          
          <Input
            type={showCurrentPassphrase ? 'text' : 'password'}
            placeholder="Passphrase actual"
            value={currentPassphrase}
            onChange={(e) => setCurrentPassphrase(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowCurrentPassphrase(!showCurrentPassphrase)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Input
            type={showNewPassphrase ? 'text' : 'password'}
            placeholder="Nueva passphrase"
            value={newPassphrase}
            onChange={(e) => setNewPassphrase(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNewPassphrase(!showNewPassphrase)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showNewPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Input
            type={showConfirmPassphrase ? 'text' : 'password'}
            placeholder="Confirma nueva passphrase"
            value={confirmPassphrase}
            onChange={(e) => setConfirmPassphrase(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassphrase(!showConfirmPassphrase)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleChangePassphraseConfirm}
              disabled={isLoading || !currentPassphrase.trim() || !newPassphrase.trim() || !confirmPassphrase.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? 'Cambiando...' : 'Cambiar'}
            </Button>
            <Button
              onClick={handleChangePassphraseCancel}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de recuperación */}
      <Modal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        title="Recuperar Passphrase"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <RefreshCw className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recupera tu passphrase usando tu cuenta de Google autenticada.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Información de Recuperación
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>• Solo funciona con la cuenta de Google actual</li>
              <li>• Los datos de recuperación expiran en 30 días</li>
              <li>• Se requiere estar autenticado con Google</li>
              <li>• La passphrase se cifra específicamente para tu cuenta</li>
            </ul>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleRecoveryAttempt}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              {isLoading ? 'Recuperando...' : 'Recuperar Passphrase'}
            </Button>
            <Button
              onClick={() => setShowRecoveryModal(false)}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};