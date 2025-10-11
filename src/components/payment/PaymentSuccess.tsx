import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        setError('No se encontró el ID de sesión');
        setIsProcessing(false);
        return;
      }

      try {
        // Aquí podrías hacer una llamada al backend para verificar el pago
        // const response = await apiService.verifyPayment(sessionId);
        
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIsProcessing(false);
      } catch (error) {
        console.error('Error procesando pago:', error);
        setError('Error al procesar el pago');
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [sessionId]);

  const handleContinue = () => {
    navigate('/account');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Procesando pago...</h2>
          <p className="text-gray-400">Por favor espera mientras confirmamos tu suscripción</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">✕</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Error en el pago</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/account')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Volver a configuración
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          ¡Pago exitoso!
        </h2>
        
        <p className="text-gray-400 mb-8">
          Tu suscripción ha sido activada exitosamente. Ya puedes disfrutar de todas las funciones premium.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continuar a configuración
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Ir al chat
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">
            <strong>ID de sesión:</strong> {sessionId}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Guarda este ID para futuras referencias
          </p>
        </div>
      </div>
    </div>
  );
};
