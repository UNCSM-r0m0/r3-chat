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
        console.log('🔍 OAuthCallback: Iniciando proceso de callback');
        console.log('🔍 OAuthCallback: URL actual:', window.location.href);
        console.log('🔍 OAuthCallback: Search params:', window.location.search);
        
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const provider = urlParams.get('provider');
        const error = urlParams.get('error');
        
        console.log('🔍 OAuthCallback: Token param:', token ? 'EXISTS' : 'NULL');
        console.log('🔍 OAuthCallback: Provider param:', provider);
        console.log('🔍 OAuthCallback: Error param:', error);

        if (error) {
          console.error('❌ OAuthCallback: Error en parámetros:', error);
          setError(`Error de autenticación: ${error}`);
          setIsProcessing(false);
          return;
        }

        if (token) {
          // Token en URL (cross-site): guardar en localStorage y usar para autenticación
          console.log('🔍 OAuthCallback: Token recibido en URL, guardando en localStorage');
          localStorage.setItem('access_token', token);
          
          // El interceptor se encargará de agregar el token automáticamente
          
          console.log('🔍 OAuthCallback: Haciendo petición a getProfile con token...');
          await getProfile();
          console.log('✅ OAuthCallback: Usuario obtenido exitosamente con token en URL');
          navigate('/', { replace: true });
        } else {
          // Sin token en URL: intentar con cookies (localhost)
          console.log('🔍 OAuthCallback: Sin token en URL, intentando con cookies');
          console.log('🔍 OAuthCallback: Document cookies:', document.cookie);
          
          const { apiService } = await import('../../services/api');
          console.log('🔍 OAuthCallback: apiService importado:', apiService);
          
          console.log('🔍 OAuthCallback: Haciendo petición a getProfile...');
          await getProfile();
          console.log('✅ OAuthCallback: Usuario obtenido exitosamente con cookies');
          navigate('/', { replace: true });
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
