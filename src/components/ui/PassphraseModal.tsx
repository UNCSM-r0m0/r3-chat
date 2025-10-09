/**
 * Modal para solicitar passphrase local de cifrado
 * Protege los datos sensibles del usuario en localStorage
 */

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';

interface PassphraseModalProps {
  isOpen: boolean;
  onConfirm: (passphrase: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  showRememberOption?: boolean;
}

export const PassphraseModal: React.FC<PassphraseModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Clave de Seguridad Local",
  description = "Ingresa una clave para proteger tus datos locales. Esta clave solo se usa en tu dispositivo y no se envía al servidor.",
  showRememberOption = true
}) => {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [isNewSession, setIsNewSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detectar si es una nueva sesión (no hay datos cifrados)
  useEffect(() => {
    if (isOpen) {
      const chatStorage = localStorage.getItem('chat-storage');
      const hasEncryptedData = chatStorage && chatStorage.includes('"v":1');
      setIsNewSession(!hasEncryptedData);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isNewSession) {
      // Nueva sesión: validar que las claves coincidan
      if (passphrase.length < 6) {
        setError('La clave debe tener al menos 6 caracteres');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setError('Las claves no coinciden');
        return;
      }
    } else {
      // Sesión existente: solo validar que no esté vacía
      if (!passphrase.trim()) {
        setError('Por favor ingresa tu clave');
        return;
      }
    }

    onConfirm(passphrase);
  };

  const handleCancel = () => {
    setPassphrase('');
    setConfirmPassphrase('');
    setError(null);
    onCancel?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Deshabilitar cierre automático
      title={title}
      size="md"
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Icono y descripción */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {description}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de clave */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isNewSession ? 'Crear clave de seguridad' : 'Ingresa tu clave'}
            </label>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Ingresa tu clave de seguridad"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              autoFocus
            />
          </div>

          {/* Campo de confirmación (solo para nuevas sesiones) */}
          {isNewSession && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar clave
              </label>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Confirma tu clave de seguridad"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>
          )}

          {/* Opción de recordar sesión */}
          {showRememberOption && !isNewSession && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-session"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="remember-session" className="text-sm text-gray-600 dark:text-gray-400">
                Recordar esta sesión (la clave se mantendrá en memoria hasta cerrar el navegador)
              </label>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Información de seguridad */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Información de seguridad:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Tu clave solo se usa localmente y nunca se envía al servidor</li>
                  <li>• Los datos se cifran con AES-256-GCM (estándar militar)</li>
                  <li>• Si olvidas tu clave, tendrás que crear una nueva sesión</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isNewSession ? 'Crear y Continuar' : 'Ingresar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
