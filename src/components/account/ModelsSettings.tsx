import React, { useState } from 'react';
import { Search, Star, Brain, Image, Filter } from 'lucide-react';
import { Button } from '../ui';
import { useModels } from '../../hooks/useModels';

export const ModelsSettings: React.FC = () => {
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
    <div className="space-y-6">
      {/* Available Models */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Available Models
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose which models appear in your model selector. This won't affect existing conversations.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search models, providers, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Filter by features</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectRecommended}
              >
                Select Recommended Models
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={unselectAll}
              >
                Unselect All
              </Button>
            </div>
          </div>
        </div>

        {/* Models List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`${getModelColor(model.provider)}`}>
                  {getModelIcon(model)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {model.name}
                    </h3>
                    {model.isPremium && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {model.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {model.features?.map((feature: string) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200">
                  Search URL
                </button>
                <button
                  onClick={() => toggleModel(model.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    selectedModels.includes(model.id) ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      selectedModels.includes(model.id) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};