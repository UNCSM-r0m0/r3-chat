import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          setError(`Error de autenticación: ${error}`);
          setIsProcessing(false);
          return;
        }

        if (code && state) {
          // Usar el servicio API para manejar el callback
          const { apiService } = await import('../../services/api');
          const response = await apiService.handleOAuthCallback(code, state);
          
          if (response.success && response.data.token && response.data.user) {
            // Guardar token y usuario
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Actualizar el estado de autenticación
            setUser(response.data.user);
            
            // Redirigir a la página principal
            navigate('/', { replace: true });
          } else {
            setError('No se recibieron los datos de autenticación');
          }
        } else {
          setError('No se recibió el código de autorización');
        }
      } catch (err) {
        console.error('Error en OAuth callback:', err);
        setError('Error interno del servidor');
      } finally {
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, setUser]);

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
