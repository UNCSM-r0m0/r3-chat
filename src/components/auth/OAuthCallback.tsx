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
        const error = urlParams.get('error');

        if (error) {
          setError(`Error de autenticación: ${error}`);
          setIsProcessing(false);
          return;
        }

        // Verificar si hay un token en la URL (del callback del backend)
        const token = urlParams.get('token');
        
        if (token) {
          // Guardar el token
          localStorage.setItem('auth_token', token);
          
          // Obtener el perfil del usuario
          const { apiService } = await import('../../services/api');
          const profileResponse = await apiService.getProfile();
          
          if (profileResponse.success && profileResponse.data) {
            // Guardar usuario
            localStorage.setItem('user', JSON.stringify(profileResponse.data));
            
            // Actualizar el estado de autenticación
            setUser(profileResponse.data);
            
            // Redirigir a la página principal
            navigate('/', { replace: true });
          } else {
            setError('No se pudo obtener el perfil del usuario');
          }
        } else {
          setError('No se recibió el token de autenticación');
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
