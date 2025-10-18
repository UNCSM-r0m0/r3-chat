import React, { useState } from 'react';
import { CreditCard, Trash2, Zap, Headphones, Rocket } from 'lucide-react';
import { Button } from '../ui';
import { useSubscription } from '../../hooks/useSubscription';

export const AccountSettings: React.FC = () => {
  const { subscription, isLoading } = useSubscription();
  const [emailReceipts, setEmailReceipts] = useState(true);

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

  const handleDeleteAccount = () => {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      // Implementar eliminación de cuenta
      console.log('Eliminar cuenta');
    }
  };

  const isPro = subscription?.tier === 'PREMIUM';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upgrade to Pro Section */}
      {!isPro && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upgrade to Pro
            </h2>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">$8/month</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Rocket className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Access to All Models
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get access to our full suite of models including Claude, o3-mini-high, Gemini 2.5 Flash, and more!
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Generous Limits
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive 1500 standard credits per month, plus 100 premium credits* per month.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Headphones className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Priority Support
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get faster responses and dedicated assistance from the T3 team whenever you need help!
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            <Button
              variant="outline"
              className="px-6"
            >
              View Previous Invoices
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            * Premium credits are used for models marked with a gem icon in the model selector. 
            This includes: o3, Claude Sonnet, Gemini 2.5 Pro, GPT 5 (Reasoning), Grok 3/4, and all image generation models. 
            Additional Premium credits can be purchased separately for $8 per 100.
          </p>
        </div>
      )}

      {/* Billing Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Billing Preferences
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Email me receipts
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send receipts to your account email when a payment succeeds.
            </p>
          </div>
          <button
            onClick={() => setEmailReceipts(!emailReceipts)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              emailReceipts ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailReceipts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">
          Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Delete Account
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <Button
            onClick={handleDeleteAccount}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
};
