import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sun, LogOut, CreditCard, Trash2, Mail, Zap, Headphones, Rocket } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';

interface Subscription {
  id: string;
  tier: 'FREE' | 'REGISTERED' | 'PREMIUM';
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIALING';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeCurrentPeriodEnd?: string;
}

interface UsageStats {
  todayMessages: number;
  todayTokens: number;
  totalMessages: number;
  totalTokens: number;
  tier: string;
  limits: {
    messagesPerDay: number;
    maxTokensPerMessage: number;
    canUploadImages: boolean;
  };
}

export const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar suscripción
      try {
        const subResponse = await apiService.getSubscription();
        if (subResponse.success) {
          setSubscription(subResponse.data);
        }
      } catch (error) {
        console.warn('Error cargando suscripción:', error);
      }

      // Cargar estadísticas de uso
      try {
        const statsResponse = await fetch('/api/chat/usage/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token') ? JSON.parse(localStorage.getItem('auth-token')!).token : ''}`,
          },
        });
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setUsageStats(stats);
        }
      } catch (error) {
        console.warn('Error cargando estadísticas:', error);
      }
    } catch (error) {
      console.error('Error cargando datos de cuenta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token') ? JSON.parse(localStorage.getItem('auth-token')!).token : ''}`,
        },
        body: JSON.stringify({
          priceId: 'price_1SF3YiRv5o1GNKvmJ2zzM5Ip'
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Error creando sesión de checkout');
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

  const getTierDisplay = () => {
    if (!subscription) return 'Free Plan';
    
    switch (subscription.tier) {
      case 'PREMIUM':
        return 'Pro';
      case 'REGISTERED':
        return 'Registered';
      default:
        return 'Free Plan';
    }
  };

  const getTierColor = () => {
    if (!subscription) return 'bg-gray-600';
    
    switch (subscription.tier) {
      case 'PREMIUM':
        return 'bg-gradient-to-r from-purple-600 to-pink-600';
      case 'REGISTERED':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const isPro = subscription?.tier === 'PREMIUM';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
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
                  <button className={`mt-2 px-3 py-1 rounded-full text-xs font-medium text-white ${getTierColor()}`}>
                    {getTierDisplay()}
                  </button>
                </div>
              </div>
            </div>

            {/* Message Usage */}
            {usageStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Message Usage
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Standard</span>
                      <span className="text-gray-900 dark:text-white">
                        {usageStats.todayMessages}/{usageStats.limits.messagesPerDay}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((usageStats.todayMessages / usageStats.limits.messagesPerDay) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {usageStats.limits.messagesPerDay - usageStats.todayMessages} messages remaining
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Each tool call (e.g. search grounding) used in a reply consumes an additional standard credit. 
                  Models may not always utilize enabled tools.
                </p>
              </div>
            )}

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
                  <button className="border-b-2 border-purple-600 py-4 px-1 text-sm font-medium text-purple-600">
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
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
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

            {/* Upgrade to Pro Section */}
            {!isPro && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
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
        </div>
      </div>
    </div>
  );
};
