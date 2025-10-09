import React from 'react';
import { AlertTriangle, X, Crown } from 'lucide-react';
import { Button } from './Button';

interface LimitNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export const LimitNotification: React.FC<LimitNotificationProps> = ({
  isVisible,
  onClose,
  onUpgrade
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-900 border border-red-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-200 mb-1">
              Límite de mensajes alcanzado
            </h3>
            <p className="text-sm text-red-300 mb-3">
              Has alcanzado tu límite de 10 mensajes por día. 
              <br />
              <span className="text-xs text-red-400">
                El límite se reinicia cada 24 horas.
              </span>
            </p>
            <div className="flex space-x-2">
              {onUpgrade && (
                <Button
                  size="sm"
                  onClick={onUpgrade}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="text-red-300 border-red-600 hover:bg-red-800 text-xs"
              >
                Entendido
              </Button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
