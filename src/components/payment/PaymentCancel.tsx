import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Pago cancelado
        </h2>
        
        <p className="text-gray-400 mb-8">
          El proceso de pago fue cancelado. No se ha realizado ningún cargo a tu cuenta.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/account')}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a configuración
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
            Si tienes alguna pregunta sobre el proceso de pago, no dudes en contactarnos.
          </p>
        </div>
      </div>
    </div>
  );
};
