import React from 'react';
import { Key, CreditCard } from 'lucide-react';
import { Button } from '../ui';

export const ApiKeysSettings: React.FC = () => {
  const handleUpgrade = async () => {
    try {
      const response = await fetch('https://jeanett-uncolorable-pickily.ngrok-free.dev/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token') ? JSON.parse(localStorage.getItem('auth-token')!).token : ''}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          priceId: 'price_1SF3YiRv5o1GNKvmJ2zzM5Ip'
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Error creando sesión de checkout:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Keys */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Key className="h-6 w-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            API Keys
          </h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Bring your own API keys for select models.
        </p>

        {/* Pro Feature Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-8 text-center">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2">Pro Feature</h3>
            <p className="text-lg mb-6">Upgrade to Pro to access this feature.</p>
            <Button
              onClick={handleUpgrade}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Upgrade to Pro - $8/month
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};