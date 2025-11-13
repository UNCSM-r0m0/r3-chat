
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AppRouter } from './components/routing';
import { useAuthStore } from './stores/auth.store';

// Componente interno para acceder a la ubicación
const AppContent = () => {
  const { checkAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();

  // Rutas públicas que no requieren verificación de autenticación
  const publicRoutes = ['/privacy', '/auth/callback', '/payment/success', '/payment/cancel', '/login'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Verificar autenticación al cargar la app (solo para rutas protegidas)
  useEffect(() => {
    const initializeAuth = async () => {
      // Si es una ruta pública, no verificar autenticación
      if (isPublicRoute) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        // Verificar si hay token en la URL (callback de OAuth)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const provider = urlParams.get('provider');

        if (token && provider) {
          // Procesar callback de OAuth
          const { loginWithGoogle } = useAuthStore.getState();
          await loginWithGoogle(token);
          
          // Limpiar la URL
          window.history.replaceState({}, document.title, '/');
        } else {
          // Verificación normal de autenticación
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

  // Mostrar loading mientras se verifica la autenticación (solo para rutas protegidas)
  if (!isPublicRoute && isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Verificando sesión...</p>
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

export default App
