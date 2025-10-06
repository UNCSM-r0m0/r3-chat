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
        console.log('🔍 OAuthCallback: Iniciando proceso de callback');
        console.log('🔍 OAuthCallback: URL actual:', window.location.href);
        console.log('🔍 OAuthCallback: Search params:', window.location.search);
        
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        console.log('🔍 OAuthCallback: Error param:', error);

        if (error) {
          console.error('❌ OAuthCallback: Error en parámetros:', error);
          setError(`Error de autenticación no llego el token: ${error}`);
          setIsProcessing(false);
          return;
        }

        // Verificar cookies antes de hacer la petición
        console.log('🔍 OAuthCallback: Document cookies:', document.cookie);
        
        // Con cookies HttpOnly, pedimos el perfil directamente (no esperamos token en query)
        console.log('🔍 OAuthCallback: Importando apiService...');
        const { apiService } = await import('../../services/api');
        console.log('🔍 OAuthCallback: apiService importado:', apiService);
        
        console.log('🔍 OAuthCallback: Haciendo petición a getProfile...');
        const user = await apiService.getProfile();
        console.log('🔍 OAuthCallback: Respuesta de getProfile:', user);

        if (user) {
          console.log('✅ OAuthCallback: Usuario obtenido exitosamente:', user);
          setUser(user);
          navigate('/', { replace: true });
        } else {
          console.error('❌ OAuthCallback: No se pudo obtener el perfil del usuario');
          setError('No se pudo obtener el perfil del usuario');
        }
      } catch (err: any) {
        console.error('❌ OAuthCallback: Error completo:', err);
        console.error('❌ OAuthCallback: Error response:', err.response);
        console.error('❌ OAuthCallback: Error status:', err.response?.status);
        console.error('❌ OAuthCallback: Error data:', err.response?.data);
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
