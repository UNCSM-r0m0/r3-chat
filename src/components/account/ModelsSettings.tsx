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
        return 'text-orange-500';
      case 'google':
        return 'text-blue-500';
      case 'openai':
        return 'text-emerald-500';
      case 'ollama':
        return 'text-purple-500';
      default:
        return 'text-[var(--text-muted)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Modelos Disponibles</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Elige qué modelos aparecen en tu selector. Esto no afecta las conversaciones existentes.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar modelos, proveedores, características..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Filter className="h-4 w-4" />
            <span>Filtrar por características</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectRecommended}
              className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/[0.04]"
            >
              Seleccionar Recomendados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={unselectAll}
              className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/[0.04]"
            >
              Deseleccionar Todo
            </Button>
          </div>
        </div>
      </div>

      {/* Models List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredModels.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No se encontraron modelos</p>
          </div>
        ) : (
          filteredModels.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-hover)] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`${getModelColor(model.provider)}`}>
                  {getModelIcon(model)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--text-primary)]">
                      {model.name}
                    </h3>
                    {model.isPremium && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 rounded-full">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {model.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {model.features?.map((feature: string) => (
                      <span
                        key={feature}
                        className="px-2 py-0.5 text-[10px] bg-[var(--bg-elevated)] text-[var(--text-secondary)] rounded"
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
                    selectedModels.includes(model.id) ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-elevated)]'
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
