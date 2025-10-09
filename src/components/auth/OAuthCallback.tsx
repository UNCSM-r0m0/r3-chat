import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { getProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

          useEffect(() => {
            const handleOAuthCallback = async () => {
              try {
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                const error = urlParams.get('error');

                if (error) {
                  console.error('OAuth error:', error);
                  setError(`Error de autenticación: ${error}`);
                  setIsProcessing(false);
                  return;
                }

                if (token) {
                  // Token en URL (cross-site): usar temporalmente para autenticación
                  // NOTA: El backend ya maneja esto con cookies HttpOnly, este es solo un fallback
                  console.warn('⚠️ Token recibido en URL - esto debería manejarse con cookies HttpOnly');
                  
                  // El interceptor se encargará de agregar el token automáticamente
                  await getProfile();
                  navigate('/', { replace: true });
                } else {
                  // Sin token en URL: usar cookies HttpOnly (método preferido)
                  await getProfile();
                  navigate('/', { replace: true });
                }
              } catch (err: any) {
                console.error('OAuth callback error:', err);
                setError('Error interno del servidor');
              } finally {
                setIsProcessing(false);
              }
            };

            handleOAuthCallback();
          }, [navigate, getProfile]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Procesando autenticación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Error de Autenticación</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};
