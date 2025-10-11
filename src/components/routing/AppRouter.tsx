import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layout';
import { LoginPage, OAuthCallback } from '../auth';
import { AccountSettings } from '../account';
import { useAuthStore } from '../../stores/auth.store';
import { useChat } from '../../hooks/useChat';
import { type ChatMessage } from '../ui/MessageBubble';

interface AppRouterProps {
  isInitialized: boolean;
}

export const AppRouter: React.FC<AppRouterProps> = ({ isInitialized }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { currentChat, sendMessage, isStreaming } = useChat();

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
          isAuthenticated ? <AccountSettings /> : <Navigate to="/login" replace />
        } 
      />

      {/* Ruta de callback de OAuth */}
      <Route 
        path="/auth/callback" 
        element={<OAuthCallback />} 
      />

      {/* Ruta de modelos (futura implementación) */}
      <Route 
        path="/models" 
        element={
          isAuthenticated ? (
            <div className="h-screen flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Modelos</h1>
                <p className="text-gray-400">Página de modelos en desarrollo...</p>
              </div>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Ruta de API Keys (futura implementación) */}
      <Route 
        path="/api-keys" 
        element={
          isAuthenticated ? (
            <div className="h-screen flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">API Keys</h1>
                <p className="text-gray-400">Página de API Keys en desarrollo...</p>
              </div>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Ruta de historial (futura implementación) */}
      <Route 
        path="/history" 
        element={
          isAuthenticated ? (
            <div className="h-screen flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Historial</h1>
                <p className="text-gray-400">Página de historial en desarrollo...</p>
              </div>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Ruta de personalización (futura implementación) */}
      <Route 
        path="/customization" 
        element={
          isAuthenticated ? (
            <div className="h-screen flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Personalización</h1>
                <p className="text-gray-400">Página de personalización en desarrollo...</p>
              </div>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Ruta de archivos adjuntos (futura implementación) */}
      <Route 
        path="/attachments" 
        element={
          isAuthenticated ? (
            <div className="h-screen flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Archivos Adjuntos</h1>
                <p className="text-gray-400">Página de archivos adjuntos en desarrollo...</p>
              </div>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Ruta de contacto (futura implementación) */}
      <Route 
        path="/contact" 
        element={
          isAuthenticated ? (
            <div className="h-screen flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Contacto</h1>
                <p className="text-gray-400">Página de contacto en desarrollo...</p>
              </div>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Ruta por defecto - redirige a la página principal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
