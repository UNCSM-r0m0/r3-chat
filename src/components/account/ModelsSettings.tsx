import React, { useState } from 'react';
import { Search, Star, Brain, Image, Filter } from 'lucide-react';
import { Button } from '../ui';
import { useModels } from '../../hooks/useModels';
import type { AIModel } from '../../types';

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

  const getModelIcon = (model: AIModel) => {
    if (model.supportsImages) return <Image className="h-4 w-4" />;
    if (model.supportsReasoning) return <Brain className="h-4 w-4" />;
    return <Star className="h-4 w-4" />;
  };

  const getModelColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return 'text-orange-400';
      case 'google':
        return 'text-blue-400';
      case 'openai':
        return 'text-emerald-400';
      case 'ollama':
        return 'text-purple-400';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Modelos Disponibles</h2>
        <p className="text-sm text-zinc-400">
          Elige qué modelos aparecen en tu selector. Esto no afecta las conversaciones existentes.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar modelos, proveedores, características..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/[0.06] rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Filter className="h-4 w-4" />
            <span>Filtrar por características</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectRecommended}
              className="border-white/10 text-zinc-300 hover:bg-white/5"
            >
              Seleccionar Recomendados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={unselectAll}
              className="border-white/10 text-zinc-300 hover:bg-white/5"
            >
              Deseleccionar Todo
            </Button>
          </div>
        </div>
      </div>

      {/* Models List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredModels.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No se encontraron modelos</p>
          </div>
        ) : (
          filteredModels.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`${getModelColor(model.provider)}`}>
                  {getModelIcon(model)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-zinc-200">
                      {model.name}
                    </h3>
                    {model.isPremium && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">
                    {model.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {model.features?.map((feature: string) => (
                      <span
                        key={feature}
                        className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleModel(model.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    selectedModels.includes(model.id) ? 'bg-purple-600' : 'bg-zinc-700'
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
          ))
        )}
      </div>
    </div>
  );
};

export default ModelsSettings;
