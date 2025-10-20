import React, { useState } from 'react';
import { Search, Star, Eye, Brain, Image, ChevronUp, Filter, Lock } from 'lucide-react';
import { Modal, Input, Button } from '../ui';
import { useModels } from '../../hooks/useModels';
import { useDebounce } from '../../hooks/useDebounce';
import { useSubscription } from '../../hooks/useSubscription';
import { cn } from '../../utils/cn';

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (model: any) => void;
  selectedModel: any;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  isOpen,
  onClose,
  onSelectModel,
  selectedModel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { models, searchModels } = useModels();
  const { canUsePremium } = useSubscription();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Determinar si el usuario tiene plan Pro/Premium según suscripción real
  const isProUser = !!canUsePremium;

  const filteredModels = debouncedSearchQuery
    ? searchModels(debouncedSearchQuery)
    : models;

  const getModelIcon = (model: any) => {
    if (model.supportsImages) return <Image className="h-4 w-4" />;
    if (model.supportsReasoning) return <Brain className="h-4 w-4" />;
    return <Star className="h-4 w-4" />;
  };

  const handleSelectModel = (model: any) => {
    // Verificar si el modelo está disponible para el usuario
    if (!isProUser && model.isPremium) {
      return; // No permitir seleccionar modelos premium para usuarios no Pro
    }
    onSelectModel(model);
    onClose();
  };

  const isModelAvailable = (model: any) => {
    // Si es usuario Pro, todos los modelos están disponibles
    if (isProUser) return true;
    // Si no es Pro, solo modelos gratuitos están disponibles
    return !model.isPremium;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select AI Model"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <Input
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />

        {/* Upgrade Banner - Solo mostrar si no es usuario Pro */}
        {!isProUser && (
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Unlock all models + higher limits</h3>
                <p className="text-sm opacity-90">Get access to premium models and increased usage</p>
              </div>
              <Button className="bg-white text-purple-600 hover:bg-gray-100">
                Upgrade now
              </Button>
            </div>
          </div>
        )}

        {/* Models List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredModels.map((model) => {
            const isAvailable = isModelAvailable(model);
            return (
              <div
                key={model.id}
                onClick={() => isAvailable && handleSelectModel(model)}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-colors',
                  isAvailable ? 'cursor-pointer' : 'cursor-not-allowed',
                  selectedModel?.id === model.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700',
                  isAvailable && selectedModel?.id !== model.id && 'hover:border-gray-300 dark:hover:border-gray-600',
                  !isAvailable && 'opacity-50'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getModelIcon(model)}
                    {model.isPremium && <Star className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {model.name}
                      </h3>
                      {!isAvailable && (
                        <Lock className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {model.description}
                      {!isAvailable && (
                        <span className="text-red-400 ml-2">(Requires Pro)</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isAvailable && (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                  {selectedModel?.id === model.id && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" leftIcon={<ChevronUp className="h-4 w-4" />}>
            Show all
          </Button>
          <Button variant="ghost" leftIcon={<Filter className="h-4 w-4" />}>
            Filter
          </Button>
        </div>
      </div>
    </Modal>
  );
};
