import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Brain, Crown, Image, Search, Shield, Star } from 'lucide-react';
import { Button } from '../ui';
import { useModels } from '../../hooks/useModels';
import { useAuth } from '../../hooks/useAuth';
import { apiService, type AdminModel, type AdminProvider } from '../../services/api';
import { useModelStore } from '../../stores/modelStore';
import type { AIModel } from '../../types';

type AdminModelRow = AdminModel & { provider_name: string };

const normalizeRole = (role?: string) => (role || '').toLowerCase();

export const ModelsSettings: React.FC = () => {
  const { allModels } = useModels();
  const { user } = useAuth();
  const reloadPublicModels = useModelStore((state) => state.loadModels);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminProviders, setAdminProviders] = useState<AdminProvider[]>([]);
  const [adminModels, setAdminModels] = useState<AdminModelRow[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [savingModelId, setSavingModelId] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  const isAdmin = normalizeRole(user?.role) === 'admin' || normalizeRole(user?.role) === 'super_admin' || user?.is_admin;

  const loadAdminModels = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setIsLoadingAdmin(true);
      setAdminError(null);
      const providers = await apiService.getAdminProviders();
      setAdminProviders(providers);

      const modelGroups = await Promise.all(
        providers.map(async (provider) => {
          const models = await apiService.getAdminProviderModels(provider.id);
          return models.map((model) => ({ ...model, provider_name: provider.name }));
        })
      );

      setAdminModels(modelGroups.flat());
    } catch (error) {
      console.error('Error cargando modelos admin:', error);
      setAdminError('No se pudieron cargar los modelos de administración. Verificá que tu usuario sea admin.');
    } finally {
      setIsLoadingAdmin(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadAdminModels();
  }, [loadAdminModels]);

  const filteredPublicModels = allModels.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdminModels = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return adminModels.filter((model) =>
      model.name.toLowerCase().includes(query) ||
      model.display_name.toLowerCase().includes(query) ||
      model.provider_name.toLowerCase().includes(query)
    );
  }, [adminModels, searchQuery]);

  const toggleModelTier = async (model: AdminModelRow) => {
    try {
      setSavingModelId(model.id);
      const updated = await apiService.updateAdminModel({ ...model, is_premium: !model.is_premium });
      setAdminModels((prev) => prev.map((item) =>
        item.id === model.id ? { ...item, ...updated, provider_name: model.provider_name } : item
      ));
      await reloadPublicModels();
    } catch (error) {
      console.error('Error actualizando modelo:', error);
      setAdminError('No se pudo actualizar el modelo.');
    } finally {
      setSavingModelId(null);
    }
  };

  const getModelIcon = (model: AIModel | AdminModelRow) => {
    if ('supportsImages' in model ? model.supportsImages : model.supports_images) return <Image className="h-4 w-4" />;
    if ('supportsReasoning' in model ? model.supportsReasoning : false) return <Brain className="h-4 w-4" />;
    return <Star className="h-4 w-4" />;
  };

  const visibleRegistered = adminModels.filter((model) => model.is_public && model.is_active && !model.is_premium).length;
  const visiblePremium = adminModels.filter((model) => model.is_public && model.is_active && model.is_premium).length;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Modelos</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {isAdmin
            ? 'Administrá qué modelos ven los usuarios registrados y cuáles quedan para Pro.'
            : 'Estos son los modelos disponibles para tu plan actual.'}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Buscar modelos o proveedores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
        />
      </div>

      {isAdmin && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
                <Shield className="h-4 w-4 text-[var(--accent-primary)]" />
                Administración de acceso
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Registered visibles: {visibleRegistered} · Pro visibles: {visiblePremium} · Providers: {adminProviders.length}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => void loadAdminModels()} disabled={isLoadingAdmin}>
              Actualizar
            </Button>
          </div>

          {adminError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {adminError}
            </div>
          )}

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            {isLoadingAdmin ? (
              <div className="text-sm text-[var(--text-muted)] py-8 text-center">Cargando modelos...</div>
            ) : filteredAdminModels.length === 0 ? (
              <div className="text-sm text-[var(--text-muted)] py-8 text-center">No se encontraron modelos para administrar.</div>
            ) : (
              filteredAdminModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between gap-4 p-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-[var(--text-muted)]">{getModelIcon(model)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-[var(--text-primary)] truncate">{model.display_name || model.name}</h3>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/[0.06] text-[var(--text-muted)]">{model.provider_name}</span>
                        {!model.is_active && <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-500/10 text-red-300">Inactivo</span>}
                        {!model.is_public && <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/10 text-amber-300">Oculto</span>}
                      </div>
                      <p className="text-sm text-[var(--text-muted)] truncate">{model.name}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void toggleModelTier(model)}
                    disabled={savingModelId === model.id}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      model.is_premium
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                    } disabled:opacity-50`}
                  >
                    {model.is_premium ? 'Pro' : 'Registered'}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {!isAdmin && (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredPublicModels.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No se encontraron modelos para tu plan.</p>
            </div>
          ) : (
            filteredPublicModels.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="text-[var(--text-muted)]">{getModelIcon(model)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[var(--text-primary)]">{model.name}</h3>
                      {model.isPremium && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">{model.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ModelsSettings;
