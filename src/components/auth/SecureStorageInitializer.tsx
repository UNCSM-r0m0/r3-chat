/**
 * Componente que inicializa el cifrado de datos locales
 * Se muestra al cargar la aplicación si hay datos cifrados o es la primera vez
 */

import React, { useState, useEffect } from 'react';
import { PassphraseModal } from '../ui/PassphraseModal';
import { useSecureStorage } from '../../hooks/useSecureStorage';

interface SecureStorageInitializerProps {
  children: React.ReactNode;
  onInitialized?: () => void;
}

export const SecureStorageInitializer: React.FC<SecureStorageInitializerProps> = ({
  children,
  onInitialized
}) => {
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { hasPassphrase, isEncryptionEnabled, setPassphrase, checkEncryptionStatus } = useSecureStorage();

  useEffect(() => {
    const initializeSecureStorage = async () => {
      try {
        // Verificar si hay datos cifrados
        const hasEncryptedData = checkEncryptionStatus();
        
        if (hasEncryptedData && !hasPassphrase) {
          // Hay datos cifrados pero no hay passphrase en memoria
          setShowPassphraseModal(true);
        } else if (!hasEncryptedData && !hasPassphrase) {
          // No hay datos cifrados y no hay passphrase - primera vez
          setShowPassphraseModal(true);
        } else {
          // Ya está inicializado
          setIsInitializing(false);
          onInitialized?.();
        }
      } catch (error) {
        console.error('Error inicializando secure storage:', error);
        setIsInitializing(false);
        onInitialized?.();
      }
    };

    initializeSecureStorage();
  }, [hasPassphrase, isEncryptionEnabled, checkEncryptionStatus, onInitialized]);

  const handlePassphraseConfirm = (passphrase: string) => {
    setPassphrase(passphrase);
    setShowPassphraseModal(false);
    setIsInitializing(false);
    onInitialized?.();
  };

  const handlePassphraseCancel = () => {
    // Si hay datos cifrados, no permitir cancelar
    if (isEncryptionEnabled) {
      return;
    }
    
    // Si no hay datos cifrados, permitir continuar sin cifrado
    setShowPassphraseModal(false);
    setIsInitializing(false);
    onInitialized?.();
  };

  // Mostrar loading mientras se inicializa
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Inicializando seguridad...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      <PassphraseModal
        isOpen={showPassphraseModal}
        onConfirm={handlePassphraseConfirm}
        onCancel={handlePassphraseCancel}
        title={isEncryptionEnabled ? "Ingresa tu Clave de Seguridad" : "Configurar Seguridad Local"}
        description={
          isEncryptionEnabled 
            ? "Ingresa tu clave para acceder a tus datos cifrados."
            : "Configura una clave para proteger tus conversaciones y configuraciones localmente."
        }
        showRememberOption={!isEncryptionEnabled}
      />
    </>
  );
};
