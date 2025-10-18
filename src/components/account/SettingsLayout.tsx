import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useUsageStats } from '../../hooks/useUsageStats';

// Importar todos los componentes de configuración
import { AccountSettings } from './AccountSettings';
import { CustomizationSettings } from './CustomizationSettings';
import { HistorySyncSettings } from './HistorySyncSettings';
import { ModelsSettings } from './ModelsSettings';
import { ApiKeysSettings } from './ApiKeysSettings';
import { AttachmentsSettings } from './AttachmentsSettings';
import { ContactUsSettings } from './ContactUsSettings';

type SettingsTab = 'account' | 'customization' | 'history' | 'models' | 'api-keys' | 'attachments' | 'contact';

export const SettingsLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { getTierDisplay, getTierColor } = useSubscription();
  const { usageStats, isLoading: statsLoading } = useUsageStats();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const tabs = [
    { id: 'account' as SettingsTab, label: 'Account', component: AccountSettings },
    { id: 'customization' as SettingsTab, label: 'Customization', component: CustomizationSettings },
    { id: 'history' as SettingsTab, label: 'History & Sync', component: HistorySyncSettings },
    { id: 'models' as SettingsTab, label: 'Models', component: ModelsSettings },
    { id: 'api-keys' as SettingsTab, label: 'API Keys', component: ApiKeysSettings },
    { id: 'attachments' as SettingsTab, label: 'Attachments', component: AttachmentsSettings },
    { id: 'contact' as SettingsTab, label: 'Contact Us', component: ContactUsSettings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AccountSettings;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Chat
              </Link>
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
                  <button className={`mt-2 px-3 py-1 rounded-full text-xs font-medium text-white ${getTierColor().replace('text-', 'bg-')}`}>
                    {getTierDisplay()}
                  </button>
                </div>
              </div>
            </div>

            {/* Message Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Message Usage
              </h3>
              {statsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : usageStats ? (
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
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No se pudieron cargar las estadísticas
                  </p>
                </div>
              )}
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
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'border-purple-600 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.label}
                      {(tab.id === 'history' || tab.id === 'attachments') && (
                        <span className="ml-1 text-xs text-orange-500">(Próximo)</span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Active Component */}
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
};
