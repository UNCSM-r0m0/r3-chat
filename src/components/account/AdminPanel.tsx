import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  BarChart3,
  Users,
  Crown,
  Eye,
  EyeOff,
  Check,
  Loader2,
  AlertCircle,
  Zap,
  Image as ImageIcon,
  Server,
  Cpu,
  ToggleLeft,
  ToggleRight,
  Globe,
  Plus,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../../constants';
import { useModelStore } from '../../stores/modelStore';
import type { AIModel } from '../../types';

type AdminTab = 'models' | 'dashboard' | 'users';

interface Provider {
  id: string;
  name: string;
  type: string;
  base_url: string;
  is_active: boolean;
  is_public: boolean;
  priority: number;
  models: ModelWithUUID[];
}

interface ModelWithUUID extends AIModel {
  model_id: string;
  provider_id: string;
  backend_name?: string;
  display_name?: string;
  max_tokens?: number;
  context_window?: number;
  supports_streaming?: boolean;
  supports_images?: boolean;
  supportsWebsiteAgent?: boolean;
  supports_website_agent?: boolean;
  config?: Record<string, unknown>;
  is_active?: boolean;
  is_public?: boolean;
  is_premium?: boolean;
}

interface UserAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  is_admin: boolean;
  messages_used_this_month: number;
  created_at: string;
}

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('models');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddModel, setShowAddModel] = useState<string | null>(null);
  const [newProvider, setNewProvider] = useState({ name: '', type: 'openai', base_url: '', api_key: '' });
  const [newModel, setNewModel] = useState({ name: '', display_name: '', description: '', max_tokens: 4096, supports_website_agent: false });
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const reloadPublicModels = useModelStore((state) => state.loadModels);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const fetchAdminData = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    setError(null);
    try {
      // Fetch providers
      const providersRes = await fetch(`${API_BASE_URL}/admin/providers`, {
        credentials: 'include'
      });
      let providersList: Provider[] = [];
      if (providersRes.ok) {
        const providersData = await providersRes.json();
        providersList = providersData.data?.providers || providersData.providers || [];
      }

      const providersWithModels = await Promise.all(
        providersList.map(async (provider: Provider) => {
          const modelsRes = await fetch(`${API_BASE_URL}/admin/providers/${provider.id}/models`, {
            credentials: 'include'
          });
          const modelsData = modelsRes.ok ? await modelsRes.json() : {};
          const providerModels = modelsData.data?.models || modelsData.models || [];
          const models = providerModels.map((raw: any): ModelWithUUID => ({
            id: raw.name,
            model_id: raw.id || raw.model_id,
            provider_id: raw.provider_id || provider.id,
            backend_name: raw.name,
            display_name: raw.display_name,
            name: raw.display_name || raw.name,
            provider: provider.name,
            description: raw.description || `Modelo ${raw.name} vía ${provider.name}`,
            maxTokens: raw.max_tokens || 4096,
            max_tokens: raw.max_tokens || 4096,
            context_window: raw.context_window || raw.max_tokens || 4096,
            supportsImages: Boolean(raw.supports_images),
            supports_images: Boolean(raw.supports_images),
            supportsWebsiteAgent: Boolean(raw.supports_website_agent || raw.config?.supports_website_agent),
            supports_website_agent: Boolean(raw.supports_website_agent || raw.config?.supports_website_agent),
            config: raw.config || {},
            supports_streaming: Boolean(raw.supports_streaming),
            isPremium: Boolean(raw.is_premium),
            is_premium: Boolean(raw.is_premium),
            isPublic: Boolean(raw.is_public),
            is_public: Boolean(raw.is_public),
            isActive: Boolean(raw.is_active),
            is_active: Boolean(raw.is_active),
            isAvailable: Boolean(raw.is_active),
            available: Boolean(raw.is_active),
          }));
          return { ...provider, models };
        })
      );

      setProviders(providersWithModels);
    } catch (err) {
      setError('Error cargando datos administrativos');
      console.error(err);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        credentials: 'include'
      });
      if (res.ok) {
        const response = await res.json();
        const usersData = response.data?.users || response.users || [];
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'models') {
      fetchAdminData();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchAdminData, fetchUsers]);

  // Refresco silencioso: no debe tapar modales ni hacer parpadear la UI.
  useEffect(() => {
    const interval = setInterval(() => {
      if (showAddProvider || showAddModel) return;
      if (activeTab === 'models') {
        fetchAdminData({ silent: true });
      } else if (activeTab === 'users') {
        fetchUsers();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, fetchAdminData, fetchUsers, showAddProvider, showAddModel]);

  const updateModel = async (model: ModelWithUUID, updates: Partial<ModelWithUUID>) => {
    if (!model.model_id) {
      setError('El modelo no tiene un ID válido');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/admin/models/${model.model_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: model.backend_name || model.id,
          display_name: model.display_name || model.name,
          description: model.description || '',
          max_tokens: model.max_tokens || model.maxTokens || 4096,
          context_window: model.context_window || model.max_tokens || model.maxTokens || 4096,
          supports_streaming: model.supports_streaming ?? true,
          supports_images: updates.supportsImages !== undefined ? updates.supportsImages : (model.supportsImages || false),
          supports_website_agent: updates.supportsWebsiteAgent !== undefined ? updates.supportsWebsiteAgent : Boolean(model.supportsWebsiteAgent || model.supports_website_agent),
          config: {
            ...(model.config || {}),
            supports_website_agent: updates.supportsWebsiteAgent !== undefined ? updates.supportsWebsiteAgent : Boolean(model.supportsWebsiteAgent || model.supports_website_agent),
            website_agent: updates.supportsWebsiteAgent !== undefined ? updates.supportsWebsiteAgent : Boolean(model.supportsWebsiteAgent || model.supports_website_agent),
          },
          is_active: updates.isActive !== undefined ? updates.isActive : (model.isActive ?? model.is_active ?? true),
          is_public: updates.isPublic !== undefined ? updates.isPublic : (model.isPublic ?? model.is_public ?? true),
          is_premium: updates.isPremium !== undefined ? updates.isPremium : model.isPremium
        })
      });
      if (res.ok) {
        showSuccess('Modelo actualizado correctamente');
        await fetchAdminData({ silent: true });
        await reloadPublicModels();
      } else {
        const err = await res.json();
        setError(err.message || 'Error actualizando modelo');
      }
    } catch (err) {
      setError('Error actualizando modelo');
    }
  };

  const updateProvider = async (provider: Provider, updates: Partial<Provider>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/providers/${provider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: provider.name,
          type: provider.type,
          base_url: provider.base_url,
          priority: provider.priority,
          is_active: updates.is_active !== undefined ? updates.is_active : provider.is_active,
          is_public: updates.is_public !== undefined ? updates.is_public : provider.is_public
        })
      });
      if (res.ok) {
        showSuccess('Provider actualizado correctamente');
        await fetchAdminData({ silent: true });
        await reloadPublicModels();
      } else {
        const err = await res.json();
        setError(err.message || 'Error actualizando provider');
      }
    } catch (err) {
      setError('Error actualizando provider');
    }
  };

  const makeUserPremium = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier: 'premium' })
      });
      if (res.ok) {
        showSuccess('Usuario actualizado a Premium');
        fetchUsers();
      }
    } catch (err) {
      setError('Error actualizando usuario');
    }
  };

  const createProvider = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newProvider.name,
          type: newProvider.type,
          base_url: newProvider.base_url,
          api_key: newProvider.api_key,
          priority: 1,
          is_public: true
        })
      });
      if (res.ok) {
        showSuccess('Provider creado correctamente');
        setShowAddProvider(false);
        setNewProvider({ name: '', type: 'openai', base_url: '', api_key: '' });
        await fetchAdminData({ silent: true });
        await reloadPublicModels();
      } else {
        const err = await res.json();
        setError(err.message || 'Error creando provider');
      }
    } catch (err) {
      setError('Error creando provider');
    }
  };

  const createModel = async (providerId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/providers/${providerId}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newModel.name,
          display_name: newModel.display_name || newModel.name,
          description: newModel.description,
          max_tokens: newModel.max_tokens,
          context_window: 8192,
          supports_streaming: true,
          supports_images: false,
          supports_website_agent: newModel.supports_website_agent,
          config: {
            supports_website_agent: newModel.supports_website_agent,
            website_agent: newModel.supports_website_agent,
          },
          is_public: true,
          is_premium: false
        })
      });
      if (res.ok) {
        showSuccess('Modelo creado correctamente');
        setShowAddModel(null);
        setNewModel({ name: '', display_name: '', description: '', max_tokens: 4096, supports_website_agent: false });
        await fetchAdminData({ silent: true });
        await reloadPublicModels();
      } else {
        const err = await res.json();
        setError(err.message || 'Error creando modelo');
      }
    } catch (err) {
      setError('Error creando modelo');
    }
  };

  const syncModels = async (providerId: string) => {
    try {
      setSyncingProvider(providerId);
      const res = await fetch(`${API_BASE_URL}/admin/providers/${providerId}/sync-models`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const result = await res.json();
        showSuccess(`Sincronización completa: ${result.added || 0} agregados, ${result.updated || 0} actualizados`);
        await fetchAdminData({ silent: true });
        await reloadPublicModels();
      } else {
        const err = await res.json();
        setError(err.message || 'Error sincronizando modelos');
      }
    } catch (err) {
      setError('Error sincronizando modelos');
    } finally {
      setSyncingProvider(null);
    }
  };

  const tabs = [
    { id: 'models' as AdminTab, label: 'Modelos', icon: Bot },
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'users' as AdminTab, label: 'Usuarios', icon: Users },
  ];

  const totalModels = providers.reduce((acc, p) => acc + p.models.length, 0);
  const totalVisionModels = providers.reduce((acc, p) => acc + p.models.filter(m => m.supportsImages).length, 0);
  const totalPremiumModels = providers.reduce((acc, p) => acc + p.models.filter(m => m.isPremium).length, 0);

  return (
    <div className="space-y-6">
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          {successMessage}
        </motion.div>
      )}

      {error && (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'models' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[var(--bg-tertiary)]/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-[var(--text-secondary)]">Providers</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">{providers.length}</span>
                  </div>
                  <div className="bg-[var(--bg-tertiary)]/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-[var(--text-secondary)]">Modelos</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">{totalModels}</span>
                  </div>
                  <div className="bg-[var(--bg-tertiary)]/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-[var(--text-secondary)]">Con Visión</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">{totalVisionModels}</span>
                  </div>
                  <div className="bg-[var(--bg-tertiary)]/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-[var(--text-secondary)]">Premium</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">{totalPremiumModels}</span>
                  </div>
                </div>

                {/* Add Provider Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAddProvider(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-xl hover:bg-[var(--accent-primary)]/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Provider
                  </button>
                </div>

                {/* Providers List */}
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-2xl overflow-hidden"
                    >
                      {/* Provider Header */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${provider.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <div>
                            <h4 className="font-semibold text-[var(--text-primary)]">{provider.name}</h4>
                            <p className="text-xs text-[var(--text-muted)]">{provider.type} · {provider.models.length} modelos</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateProvider(provider, { is_active: !provider.is_active });
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              provider.is_active ? 'text-emerald-400' : 'text-red-400'
                            }`}
                            title={provider.is_active ? 'Activo' : 'Inactivo'}
                          >
                            {provider.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateProvider(provider, { is_public: !provider.is_public });
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              provider.is_public ? 'text-blue-400' : 'text-zinc-600'
                            }`}
                            title={provider.is_public ? 'Público' : 'Privado'}
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                          {provider.type === 'ollama' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                syncModels(provider.id);
                              }}
                              disabled={syncingProvider === provider.id}
                              className="p-2 rounded-lg transition-colors text-purple-400 hover:bg-purple-400/10 disabled:opacity-50"
                              title="Sincronizar modelos desde Ollama"
                            >
                              {syncingProvider === provider.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Models List */}
                      {expandedProvider === provider.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="border-t border-[var(--border-subtle)]"
                        >
                          <div className="p-4 space-y-2">
                            {provider.models.map((model) => (
                              <div
                                key={model.model_id || model.id}
                                className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)]/30 rounded-xl"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-2 h-2 rounded-full ${model.isPremium ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{model.name}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{model.maxTokens?.toLocaleString()} tokens · {model.description?.substring(0, 50)}...</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => updateModel(model, { supportsImages: !model.supportsImages })}
                                    title={model.supportsImages ? 'Tiene visión' : 'Sin visión'}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      model.supportsImages
                                        ? 'text-blue-400 hover:bg-blue-400/10'
                                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]'
                                    }`}
                                  >
                                    {model.supportsImages ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => updateModel(model, { supportsWebsiteAgent: !model.supportsWebsiteAgent })}
                                    title={model.supportsWebsiteAgent ? 'Website Agent habilitado' : 'Sin Website Agent'}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      model.supportsWebsiteAgent
                                        ? 'text-purple-400 hover:bg-purple-400/10'
                                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]'
                                    }`}
                                  >
                                    <Bot className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => updateModel(model, { isPremium: !model.isPremium })}
                                    title={model.isPremium ? 'Premium' : 'Gratuito'}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      model.isPremium
                                        ? 'text-amber-400 hover:bg-amber-400/10'
                                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]'
                                    }`}
                                  >
                                    <Crown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => updateModel(model, { isPublic: !model.isPublic })}
                                    title="Público/Privado"
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      model.isPublic !== false
                                        ? 'text-blue-400 hover:bg-blue-400/10'
                                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]'
                                    }`}
                                  >
                                    <Globe className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => setShowAddModel(provider.id)}
                              className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)]/30 border border-dashed border-[var(--border-subtle)] rounded-xl hover:bg-white/[0.04] hover:text-[var(--text-primary)] transition-all"
                            >
                              <Plus className="w-4 h-4" />
                              Agregar Modelo
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-tertiary)]/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-[var(--text-secondary)]">Total Usuarios</span>
              </div>
              <span className="text-2xl font-bold text-[var(--text-primary)]">{users.length}</span>
            </div>
            <div className="bg-[var(--bg-tertiary)]/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-[var(--text-secondary)]">Premium</span>
              </div>
              <span className="text-2xl font-bold text-[var(--text-primary)]">{users.filter(u => u.role === 'premium').length}</span>
            </div>
            <div className="bg-[var(--bg-tertiary)]/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-[var(--text-secondary)]">Modelos</span>
              </div>
              <span className="text-2xl font-bold text-[var(--text-primary)]">{totalModels}</span>
            </div>
            <div className="bg-[var(--bg-tertiary)]/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-[var(--text-secondary)]">Con Visión</span>
              </div>
              <span className="text-2xl font-bold text-[var(--text-primary)]">{totalVisionModels}</span>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 text-[var(--text-muted)]">
                No hay usuarios registrados
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{user.name || user.email}</p>
                      <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          user.role === 'premium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : user.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {user.role}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {user.messages_used_this_month} msgs
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {user.role !== 'premium' && user.role !== 'admin' && (
                    <button
                      onClick={() => makeUserPremium(user.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-sm transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Hacer Premium
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal: Add Provider */}
      {showAddProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Agregar Provider</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre del provider"
                value={newProvider.name}
                onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
              />
              <select
                value={newProvider.type}
                onChange={(e) => setNewProvider(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="ollama">Ollama</option>
                <option value="lmstudio">LM Studio</option>
                <option value="custom">Custom</option>
              </select>
              <input
                type="text"
                placeholder="Base URL"
                value={newProvider.base_url}
                onChange={(e) => setNewProvider(prev => ({ ...prev, base_url: e.target.value }))}
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
              />
              <input
                type="password"
                placeholder="API Key (opcional)"
                value={newProvider.api_key}
                onChange={(e) => setNewProvider(prev => ({ ...prev, api_key: e.target.value }))}
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddProvider(false)}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createProvider}
                disabled={!newProvider.name || !newProvider.base_url}
                className="px-4 py-2 text-sm font-medium bg-[var(--accent-primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Crear Provider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Model */}
      {showAddModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Agregar Modelo</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre del modelo (ej: gpt-4)"
                value={newModel.name}
                onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Nombre visible (opcional)"
                value={newModel.display_name}
                onChange={(e) => setNewModel(prev => ({ ...prev, display_name: e.target.value }))}
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Descripción"
                value={newModel.description}
                onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
              />
                <input
                  type="number"
                  placeholder="Max Tokens"
                  value={newModel.max_tokens}
                  onChange={(e) => setNewModel(prev => ({ ...prev, max_tokens: parseInt(e.target.value) || 4096 }))}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
                />
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={newModel.supports_website_agent}
                    onChange={(e) => setNewModel(prev => ({ ...prev, supports_website_agent: e.target.checked }))}
                    className="accent-purple-500"
                  />
                  Habilitar Website Agent
                </label>
              </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModel(null)}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => createModel(showAddModel)}
                disabled={!newModel.name}
                className="px-4 py-2 text-sm font-medium bg-[var(--accent-primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Crear Modelo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
