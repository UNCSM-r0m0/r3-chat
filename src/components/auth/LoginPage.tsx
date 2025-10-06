import React, { useEffect } from 'react';
import { ArrowLeft, Github } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../constants';

export const LoginPage: React.FC = () => {
  const { isLoading } = useAuth();

  // Manejar el callback de OAuth
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state) {
        try {
          // Aquí deberías hacer una llamada a tu backend para intercambiar el code por un token
          // Por ahora, redirigimos directamente a la página principal
          window.location.href = '/';
        } catch (error) {
          console.error('Error en OAuth callback:', error);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleGitHubLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header con botón de regreso */}
      <div className="p-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Chat
        </button>
      </div>

      {/* Contenido principal centrado */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {/* Título */}
          <h1 className="text-4xl font-bold text-white mb-8">
            Welcome to R3.chat
          </h1>
          
          {/* Mensaje de bienvenida */}
          <p className="text-white text-lg mb-12">
            Sign in below (we'll increase your message limits if you do) 😊
          </p>

          {/* Botón de Google - estilo T3.chat exacto */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-12 text-base font-medium flex items-center justify-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-lg"
          >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-gray-800 font-bold text-sm">G</span>
            </div>
            <span>Continue with Google</span>
          </button>

          {/* Botón de GitHub - estilo secundario */}
          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded-lg h-12 text-base font-medium flex items-center justify-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Github className="h-6 w-6" />
            <span>Continue with GitHub</span>
          </button>

          {/* Términos y condiciones */}
          <p className="text-gray-400 text-sm mt-8">
            By continuing, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
