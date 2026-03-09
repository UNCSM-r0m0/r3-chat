import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../layout';
import { useAuthStore } from '../../stores/auth.store';
import { useChat } from '../../hooks/useChat';

const LoginPage = lazy(async () => {
  const module = await import('../auth/LoginPage');
  return { default: module.LoginPage };
});

const OAuthCallback = lazy(async () => {
  const module = await import('../auth/OAuthCallback');
  return { default: module.OAuthCallback };
});

const SettingsLayout = lazy(async () => {
  const module = await import('../account/SettingsLayout');
  return { default: module.SettingsLayout };
});

const PaymentSuccess = lazy(async () => {
  const module = await import('../payment/PaymentSuccess');
  return { default: module.PaymentSuccess };
});

const PaymentCancel = lazy(async () => {
  const module = await import('../payment/PaymentCancel');
  return { default: module.PaymentCancel };
});

const PrivacyPolicy = lazy(async () => {
  const module = await import('../legal/PrivacyPolicy');
  return { default: module.PrivacyPolicy };
});

interface AppRouterProps {
  isInitialized: boolean;
}

// Componente para rutas que requieren chat
const ChatRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const {
    currentChat,
    sendMessage,
    isStreaming,
    isLimitReached,
    loadChats,
    initializeSocket,
    disconnectSocket,
  } = useChat();

  useEffect(() => {
    if (!isAuthenticated) return;

    loadChats();
    initializeSocket();

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, loadChats, initializeSocket, disconnectSocket]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
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
  );
};

const RouteLoader: React.FC = () => (
  <div className="h-screen flex items-center justify-center bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
      <p className="text-white text-sm">Cargando vista...</p>
    </div>
  </div>
);

const AppRouterContent: React.FC<AppRouterProps> = ({ isInitialized }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Rutas públicas que no requieren autenticación ni inicialización
  const isPublicRoute = location.pathname === '/privacy' || 
                        location.pathname === '/auth/callback' ||
                        location.pathname === '/payment/success' ||
                        location.pathname === '/payment/cancel';

  // Mostrar loading mientras se verifica la autenticación (solo para rutas protegidas)
  if (!isPublicRoute && isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se inicializa el almacenamiento seguro (solo para rutas protegidas)
  if (!isPublicRoute && !isInitialized) {
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
        element={<ChatRoutes />}
      />

      {/* Ruta de login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Suspense fallback={<RouteLoader />}>
              <LoginPage />
            </Suspense>
          )
        } 
      />

      {/* Ruta de configuración de cuenta */}
      <Route 
        path="/account" 
        element={
          isAuthenticated ? (
            <Suspense fallback={<RouteLoader />}>
              <SettingsLayout />
            </Suspense>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Ruta de callback de OAuth */}
      <Route 
        path="/auth/callback" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <OAuthCallback />
          </Suspense>
        } 
      />

      {/* Ruta de éxito de pago de Stripe */}
      <Route 
        path="/payment/success" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <PaymentSuccess />
          </Suspense>
        } 
      />

      {/* Ruta de cancelación de pago de Stripe */}
      <Route 
        path="/payment/cancel" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <PaymentCancel />
          </Suspense>
        } 
      />

      {/* Ruta pública de Política de Privacidad - No requiere autenticación */}
      <Route 
        path="/privacy" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <PrivacyPolicy />
          </Suspense>
        } 
      />

      {/* Ruta por defecto - redirige a la página principal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const AppRouter: React.FC<AppRouterProps> = (props) => {
  return <AppRouterContent {...props} />;
};
