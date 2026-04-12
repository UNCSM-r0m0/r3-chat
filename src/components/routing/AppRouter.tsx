import React, { Suspense, lazy, useEffect, useMemo } from 'react';
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

const TermsOfService = lazy(async () => {
  const module = await import('../legal/TermsOfService');
  return { default: module.TermsOfService };
});

const NotFoundPage = lazy(async () => {
  const module = await import('../legal/NotFoundPage');
  return { default: module.NotFoundPage };
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
    isSelectingChat,
    isLimitReached,
    loadChats,
    initializeSocket,
  } = useChat();

  useEffect(() => {
    if (!isAuthenticated) return;

    loadChats();
    initializeSocket();
    // NOTE: We intentionally DON'T disconnect socket on cleanup here.
    // React StrictMode double-mounts components, causing unnecessary disconnect/reconnect.
    // Socket disconnection is handled in:
    // 1. auth.store.ts logout() - when user actually logs out
    // 2. App.tsx - when the entire app unmounts
  }, [isAuthenticated, loadChats, initializeSocket]);

  const conversationLoadingVariant = useMemo<'default' | 'code' | 'math'>(() => {
    const title = currentChat?.title?.toLowerCase() || '';
    const model = currentChat?.model?.toLowerCase() || '';
    const messages = currentChat?.messages || [];

    const codeLikeTitle = /(html|css|js|javascript|typescript|python|java|c\+\+|c#|sql|api|script|c[oó]digo|program|desarroll)/i.test(title);
    const codeLikeModel = /(coder|code|dev)/i.test(model);
    const codeLikeContent = messages.some((msg) => /```|<\/?[a-z]+>|function\s+\w+|const\s+\w+|import\s+\w+|class\s+\w+/i.test(msg.content || ''));

    const mathLikeTitle = /(math|matem|algebra|c[aá]lcul|f[ií]sic|qu[ií]mic|ecuaci|teorema|derivad|integral)/i.test(title);
    const mathLikeModel = /(math|reason)/i.test(model);
    const mathLikeContent = messages.some((msg) => /(\$[^$]+\$|\$\$[\s\S]*?\$\$|\\(?:frac|sum|int|sqrt|alpha|beta|gamma|theta|Delta|pi)\b|\b(?:sin|cos|tan|log|ln)\s*\(|[A-Za-z]\^[0-9]+|\d+\s*[+\-*/=]\s*\d+)/i.test(msg.content || ''));

    if (codeLikeTitle || codeLikeModel || codeLikeContent) {
      return 'code';
    }

    if (mathLikeTitle || mathLikeModel || mathLikeContent) {
      return 'math';
    }

    return 'default';
  }, [currentChat?.title, currentChat?.model, currentChat?.messages]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-20 rounded-full animate-pulse" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4 relative" />
          </div>
          <p className="text-zinc-400 text-sm">Cargando...</p>
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
      isConversationLoading={isSelectingChat}
      conversationLoadingVariant={conversationLoadingVariant}
      inputDisabled={isLimitReached}
      disabledReason="Has alcanzado tu límite de mensajes por día."
    />
  );
};

const RouteLoader: React.FC = () => (
  <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
    <div className="text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-20 rounded-full animate-pulse" />
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-3 relative" />
      </div>
      <p className="text-zinc-400 text-sm">Cargando vista...</p>
    </div>
  </div>
);

// Componente para rutas públicas que no requieren inicialización
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<RouteLoader />}>
      {children}
    </Suspense>
  );
};

const AppRouterContent: React.FC<AppRouterProps> = ({ isInitialized }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Rutas públicas que no requieren autenticación ni inicialización
  const pathname = location.pathname.toLowerCase();
  const isPublicRoute = pathname === '/privacy' || 
                        pathname === '/terms' ||
                        pathname === '/terms-of-service' ||
                        pathname === '/auth/callback' ||
                        pathname === '/payment/success' ||
                        pathname === '/payment/cancel' ||
                        pathname.startsWith('/privacy/') || 
                        pathname.startsWith('/terms/');

  // Para rutas públicas, renderizar inmediatamente sin esperar inicialización
  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/privacy" element={<PublicRoute><PrivacyPolicy /></PublicRoute>} />
        <Route path="/terms" element={<PublicRoute><TermsOfService /></PublicRoute>} />
        <Route path="/auth/callback" element={<PublicRoute><OAuthCallback /></PublicRoute>} />
        <Route path="/payment/success" element={<PublicRoute><PaymentSuccess /></PublicRoute>} />
        <Route path="/payment/cancel" element={<PublicRoute><PaymentCancel /></PublicRoute>} />
        <Route path="*" element={<Navigate to={location.pathname} replace />} />
      </Routes>
    );
  }

  // Mostrar loading mientras se verifica la autenticación (solo para rutas protegidas)
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-20 rounded-full animate-pulse" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4 relative" />
          </div>
          <p className="text-zinc-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se inicializa el almacenamiento seguro
  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-20 rounded-full animate-pulse" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4 relative" />
          </div>
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

      {/* Nota: Las rutas públicas (/privacy, /terms) están manejadas arriba */}

      {/* Ruta 404 - Not Found */}
      <Route 
        path="/404" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <NotFoundPage />
          </Suspense>
        } 
      />

      {/* Ruta por defecto - 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export const AppRouter: React.FC<AppRouterProps> = (props) => {
  return <AppRouterContent {...props} />;
};
