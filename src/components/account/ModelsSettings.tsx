import React, { useState } from 'react';
import { ArrowLeft, Sun, Search, Star, Eye, Brain, Image, ChevronUp, Filter, Lock } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { useModels } from '../../hooks/useModels';

export const ModelsSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { models } = useModels();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-2.5-flash']);

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const selectRecommended = () => {
    const recommended = ['gemini-2.5-flash', 'claude-4.5-haiku', 'gpt-4o-mini'];
    setSelectedModels(recommended);
  };

  const unselectAll = () => {
    setSelectedModels([]);
  };

  const getModelIcon = (model: any) => {
    if (model.supportsImages) return <Image className="h-4 w-4" />;
    if (model.supportsReasoning) return <Brain className="h-4 w-4" />;
    return <Star className="h-4 w-4" />;
  };

  const getModelColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return 'text-orange-500';
      case 'google':
        return 'text-blue-500';
      case 'openai':
        return 'text-green-500';
      case 'ollama':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
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
                  <button className="border-b-2 border-purple-600 py-4 px-1 text-sm font-medium text-purple-600">
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

            {/* Available Models */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Available Models
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose which models appear in your model selector. This won't affect existing conversations.
              </p>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search models, providers, features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Filter by features
                </span>
                <div className="flex space-x-2">
                  <Button
                    onClick={selectRecommended}
                    variant="outline"
                    className="px-4 py-2"
                  >
                    Select Recommended Models
                  </Button>
                  <Button
                    onClick={unselectAll}
                    variant="outline"
                    className="px-4 py-2"
                  >
                    Unselect All
                  </Button>
                </div>
              </div>

              {/* Models List */}
              <div className="space-y-4">
                {filteredModels.map((model) => {
                  const isSelected = selectedModels.includes(model.id);
                  const isUnavailable = !model.available;
                  
                  return (
                    <div
                      key={model.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${isUnavailable ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex items-center space-x-2">
                            {getModelIcon(model)}
                            {model.isPremium && <Star className="h-4 w-4 text-yellow-500" />}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {model.name}
                              </h3>
                              {isUnavailable && (
                                <Lock className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {model.description}
                            </p>
                            
                            <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 mb-2">
                              Show more
                            </button>
                            
                            {/* Features */}
                            <div className="flex flex-wrap gap-1">
                              {model.features?.map((feature, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!isUnavailable && (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                          
                          <button
                            onClick={() => !isUnavailable && toggleModel(model.id)}
                            disabled={isUnavailable}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              isUnavailable
                                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                : isSelected
                                ? 'bg-purple-600'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isSelected ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200">
                          Search URL
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <Button variant="ghost" leftIcon={<ChevronUp className="h-4 w-4" />}>
                  Show all
                </Button>
                <Button variant="ghost" leftIcon={<Filter className="h-4 w-4" />}>
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
