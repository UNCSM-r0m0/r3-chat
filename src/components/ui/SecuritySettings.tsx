/**
 * Componente para configurar la seguridad local
 * Permite al usuario habilitar/deshabilitar el cifrado de datos
 */

import React, { useState } from 'react';
import { Shield, Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { PassphraseModal } from './PassphraseModal';
import { useSecureStorage } from '../../hooks/useSecureStorage';

interface SecuritySettingsProps {
  onClose?: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onClose }) => {
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const { isEncryptionEnabled, setPassphrase, clearPassphrase } = useSecureStorage();

  const handleEnableEncryption = () => {
    setShowPassphraseModal(true);
  };

  const handleDisableEncryption = () => {
    if (confirm('¿Estás seguro de que quieres deshabilitar el cifrado? Tus datos locales quedarán sin protección.')) {
      clearPassphrase();
      // Recargar la página para aplicar cambios
      window.location.reload();
    }
  };

  const handlePassphraseConfirm = (passphrase: string) => {
    setPassphrase(passphrase);
    setShowPassphraseModal(false);
    // Recargar la página para aplicar cambios
    window.location.reload();
  };

  const handlePassphraseCancel = () => {
    setShowPassphraseModal(false);
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
          Protege tus datos locales con cifrado
        </p>
      </div>

      {/* Estado actual */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          {isEncryptionEnabled ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">
                  Cifrado habilitado
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tus datos están protegidos con AES-256-GCM
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
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
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-3">
        {!isEncryptionEnabled ? (
          <Button
            onClick={handleEnableEncryption}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            leftIcon={<Lock className="h-4 w-4" />}
          >
            Habilitar Cifrado
          </Button>
        ) : (
          <Button
            onClick={handleDisableEncryption}
            variant="ghost"
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            leftIcon={<Unlock className="h-4 w-4" />}
          >
            Deshabilitar Cifrado
          </Button>
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

      {/* Modal de passphrase */}
      <PassphraseModal
        isOpen={showPassphraseModal}
        onConfirm={handlePassphraseConfirm}
        onCancel={handlePassphraseCancel}
        title="Habilitar Cifrado Local"
        description="Configura una clave para proteger tus datos locales. Esta clave solo se usa en tu dispositivo."
        showRememberOption={false}
      />
    </div>
  );
};
