
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { LoginPage, OAuthCallback } from './components/auth';
import { SecureStorageInitializer } from './components/ui/SecureStorageInitializer';
import { useAuthStore } from './stores/auth.store';

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const initializeAuth = async () => {
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
  }, [checkAuth]);

  const handleInitialized = () => {
    setIsInitialized(true);
  };

  const handleError = (error: string) => {
    console.error('Error de inicialización:', error);
    // En caso de error, continuar sin cifrado
    setIsInitialized(true);
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Mostrar inicializador de almacenamiento seguro
  if (!isInitialized) {
    return (
      <SecureStorageInitializer
        onInitialized={handleInitialized}
        onError={handleError}
      />
    );
  }

  return (
    <Router>
      <Routes>
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
              <MainLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } 
        />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App
