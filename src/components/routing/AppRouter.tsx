import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layout';
import { LoginPage, OAuthCallback } from '../auth';
import { SettingsLayout } from '../account';
import { PaymentSuccess, PaymentCancel } from '../payment';
import { useAuthStore } from '../../stores/auth.store';
import { useChat } from '../../hooks/useChat';

interface AppRouterProps {
  isInitialized: boolean;
}

export const AppRouter: React.FC<AppRouterProps> = ({ isInitialized }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { currentChat, sendMessage, isStreaming, isLimitReached } = useChat();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se inicializa el almacenamiento seguro
  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta principal - Chat */}
      <Route
        path="/"
        element={
          isLoading ? (
            <div className="h-screen flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-white">Cargando...</p>
              </div>
            </div>
          ) : isAuthenticated ? (
            <MainLayout 
              messages={(currentChat?.messages || []).map(msg => ({
                id: msg.id,
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content
              }))}
              onSend={sendMessage}
              isStreaming={isStreaming}
              inputDisabled={isLimitReached}
              disabledReason="Has alcanzado tu límite de mensajes por día."
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Ruta de login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } 
      />

      {/* Ruta de configuración de cuenta */}
      <Route 
        path="/account" 
        element={
          isAuthenticated ? <SettingsLayout /> : <Navigate to="/login" replace />
        } 
      />

      {/* Ruta de callback de OAuth */}
      <Route 
        path="/auth/callback" 
        element={<OAuthCallback />} 
      />

      {/* Ruta de éxito de pago de Stripe */}
      <Route 
        path="/payment/success" 
        element={<PaymentSuccess />} 
      />

      {/* Ruta de cancelación de pago de Stripe */}
      <Route 
        path="/payment/cancel" 
        element={<PaymentCancel />} 
      />


      {/* Ruta por defecto - redirige a la página principal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
