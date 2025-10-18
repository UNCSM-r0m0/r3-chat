import React from 'react';
import { ArrowLeft, Sun, CreditCard } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';

export const ApiKeysSettings: React.FC = () => {
  const { user, logout } = useAuth();

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Chat
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Sun className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-1/3">
            {/* User Profile */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl font-medium">
                  {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user?.name ?? 'Usuario'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <button className="mt-2 px-3 py-1 rounded-full text-xs font-medium text-white bg-gray-600">
                    Free Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Message Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Message Usage
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Standard</span>
                    <span className="text-gray-900 dark:text-white">0/20</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div className="bg-purple-600 h-2 rounded-full w-0"></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    20 messages remaining
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Each tool call (e.g. search grounding) used in a reply consumes an additional standard credit. 
                Models may not always utilize enabled tools.
              </p>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Search</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                    Ctrl K
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New Chat</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                    Ctrl Shift O
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Toggle Sidebar</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                    Ctrl B
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Account
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Customization
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    History & Sync
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Models
                  </button>
                  <button className="border-b-2 border-purple-600 py-4 px-1 text-sm font-medium text-purple-600">
                    API Keys
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Attachments
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Contact Us
                  </button>
                </nav>
              </div>
            </div>

            {/* API Keys Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                API Keys
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Bring your own API keys for select models.
              </p>

              {/* Pro Feature Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center text-white">
                <div className="max-w-md mx-auto">
                  <h3 className="text-2xl font-bold mb-4">Pro Feature</h3>
                  <p className="text-lg mb-6 opacity-90">
                    Upgrade to Pro to access this feature.
                  </p>
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
        </div>
      </div>
    </div>
  );
};
