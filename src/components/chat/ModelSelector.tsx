import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Star, 
  Brain, 
  Image, 
  Sparkles, 
  Lock, 
  Check,
  Zap,
  X
} from 'lucide-react';
import { useModels } from '../../hooks/useModels';
import { useDebounce } from '../../hooks/useDebounce';
import { useSubscription } from '../../hooks/useSubscription';
import { cn } from '../../utils/cn';
import type { AIModel } from '../../types';

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (model: AIModel) => void;
  selectedModel: AIModel | null;
}

// Modelos de respaldo en caso de que no carguen del backend
const FALLBACK_MODELS: AIModel[] = [
  {
    id: 'kimi-k2',
    name: 'Kimi K2',
    provider: 'openai',
    description: 'Modelo avanzado de Moonshot AI',
    isAvailable: true,
    available: true,
    isPremium: false,
    supportsImages: false,
    supportsReasoning: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Modelo multimodal de OpenAI',
    isAvailable: true,
    available: true,
    isPremium: true,
    supportsImages: true,
    supportsReasoning: true,
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'claude',
    description: 'Modelo avanzado de Anthropic',
    isAvailable: true,
    available: true,
    isPremium: true,
    supportsImages: true,
    supportsReasoning: true,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Modelo rápido de Google',
    isAvailable: true,
    available: true,
    isPremium: false,
    supportsImages: true,
    supportsReasoning: false,
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: 'Modelo de código abierto avanzado',
    isAvailable: true,
    available: true,
    isPremium: false,
    supportsImages: false,
    supportsReasoning: true,
  },
  {
    id: 'llama-4',
    name: 'Llama 4',
    provider: 'ollama',
    description: 'Modelo open source de Meta',
    isAvailable: true,
    available: true,
    isPremium: false,
    supportsImages: false,
    supportsReasoning: true,
  },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  isOpen,
  onClose,
  onSelectModel,
  selectedModel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { allModels, isLoading } = useModels();
  const { canUsePremium } = useSubscription();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Usar modelos del backend o fallback
  const modelsToShow = useMemo(() => {
    if (allModels.length > 0) return allModels;
    return FALLBACK_MODELS;
  }, [allModels]);

  // Determinar si el usuario tiene plan Pro/Premium
  const isProUser = !!canUsePremium;

  // Filtrar modelos según búsqueda
  const filteredModels = useMemo(() => {
    if (!debouncedSearchQuery) return modelsToShow;
    return modelsToShow.filter(model => 
      model.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [modelsToShow, debouncedSearchQuery]);

  // Separar modelos gratuitos y premium
  const freeModels = filteredModels.filter(m => !m.isPremium);
  const premiumModels = filteredModels.filter(m => m.isPremium);

  const getModelIcon = (model: AIModel) => {
    if (model.supportsImages) return <Image className="h-4 w-4 text-blue-400" />;
    if (model.supportsReasoning) return <Brain className="h-4 w-4 text-purple-400" />;
    return <Sparkles className="h-4 w-4 text-emerald-400" />;
  };

  const handleSelectModel = (model: AIModel) => {
    if (!isProUser && model.isPremium) return;
    onSelectModel(model);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#0f0f0f] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-xl font-bold text-white">Seleccionar Modelo</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {filteredModels.length} modelos disponibles
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar modelos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/[0.08] rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-white/20 focus:outline-none transition-all"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-20 rounded-full animate-pulse" />
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 relative" />
              </div>
            </div>
          )}

          {/* Upgrade Banner - Solo mostrar si no es usuario Pro */}
          {!isProUser && !isLoading && (
            <div className="relative overflow-hidden rounded-xl border border-white/[0.06] mb-5">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
              <div className="relative p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Desbloquea todos los modelos</h3>
                    <p className="text-xs text-zinc-400">Accede a modelos premium y límites aumentados</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white text-purple-600 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors">
                  Actualizar
                </button>
              </div>
            </div>
          )}

          {/* Models List */}
          {!isLoading && (
            <div className="space-y-5">
              {/* Free Models Section */}
              {freeModels.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-1">
                    Modelos Gratuitos
                  </h3>
                  <div className="space-y-2">
                    {freeModels.map((model) => (
                      <ModelCard
                        key={model.id}
                        model={model}
                        isSelected={selectedModel?.id === model.id}
                        isAvailable={true}
                        onClick={() => handleSelectModel(model)}
                        getModelIcon={getModelIcon}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Models Section */}
              {premiumModels.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                    Modelos Premium
                    {!isProUser && <Lock className="w-3 h-3 text-amber-400" />}
                  </h3>
                  <div className="space-y-2">
                    {premiumModels.map((model) => (
                      <ModelCard
                        key={model.id}
                        model={model}
                        isSelected={selectedModel?.id === model.id}
                        isAvailable={isProUser}
                        onClick={() => handleSelectModel(model)}
                        getModelIcon={getModelIcon}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredModels.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">No se encontraron modelos</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Componente de tarjeta de modelo
interface ModelCardProps {
  model: AIModel;
  isSelected: boolean;
  isAvailable: boolean;
  onClick: () => void;
  getModelIcon: (model: AIModel) => React.ReactNode;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isSelected,
  isAvailable,
  onClick,
  getModelIcon,
}) => {
  return (
    <motion.button
      whileHover={isAvailable ? { scale: 1.01 } : {}}
      whileTap={isAvailable ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
        isSelected
          ? 'bg-purple-500/10 border-purple-500/30'
          : 'bg-zinc-900/30 border-white/[0.06] hover:border-white/[0.12]',
        !isAvailable && 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        isSelected ? 'bg-purple-500/20' : 'bg-zinc-800'
      )}>
        {getModelIcon(model)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            'font-medium truncate',
            isSelected ? 'text-purple-300' : 'text-zinc-200'
          )}>
            {model.name}
          </h3>
          {model.isPremium && (
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          )}
          {!isAvailable && (
            <Lock className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </div>
        <p className="text-xs text-zinc-500 truncate">
          {model.description}
        </p>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
    </motion.button>
  );
};

export default ModelSelector;
