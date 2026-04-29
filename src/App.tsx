import { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AppRouter } from './components/routing';
import { useAuthStore } from './stores/auth.store';

const AppContent = () => {
  const { checkAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();

  const publicRoutes = ['/privacy', '/auth/callback', '/payment/success', '/payment/cancel', '/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isPublicRoute) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const provider = urlParams.get('provider');

        if (token && provider) {
          const { loginWithGoogle } = useAuthStore.getState();
          await loginWithGoogle(token);
          window.history.replaceState({}, document.title, '/');
        } else {
          await checkAuth();
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeAuth();
  }, [checkAuth, isPublicRoute]);

  if (!isPublicRoute && isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-primary)]">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <AppRouter isInitialized={true} />;
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
