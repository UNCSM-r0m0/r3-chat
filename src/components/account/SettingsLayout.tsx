import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Palette, 
  History, 
  Bot, 
  Key, 
  Paperclip, 
  Mail,
  LogOut,
  Sparkles,
  Command,
  MessageSquare,
  Trash2,
  Search,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useUsageStats } from '../../hooks/useUsageStats';
import { useChat } from '../../hooks/useChat';
import { Button } from '../ui';

// Importar componentes de configuración
import { AccountSettings } from './AccountSettings';
import { CustomizationSettings } from './CustomizationSettings';
import { ModelsSettings } from './ModelsSettings';
import { ContactUsSettings } from './ContactUsSettings';

type SettingsTab = 'account' | 'customization' | 'history' | 'models' | 'api-keys' | 'attachments' | 'contact';

interface Tab {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
  badge?: string;
}

export const SettingsLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { getTierDisplay, getTierColor } = useSubscription();
  const { usageStats, isLoading: statsLoading } = useUsageStats();
  const { chats, deleteChat } = useChat();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());

  const tabs: Tab[] = [
    { id: 'account', label: 'Cuenta', icon: User, component: AccountSettings },
    { id: 'customization', label: 'Personalización', icon: Palette, component: CustomizationSettings },
    { id: 'history', label: 'Historial', icon: History, component: HistoryTab },
    { id: 'models', label: 'Modelos', icon: Bot, component: ModelsSettings },
    { id: 'api-keys', label: 'API Keys', icon: Key, component: ApiKeysPlaceholder },
    { id: 'attachments', label: 'Adjuntos', icon: Paperclip, component: AttachmentsPlaceholder },
    { id: 'contact', label: 'Contacto', icon: Mail, component: ContactUsSettings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AccountSettings;

  // Componente Modal de Confirmación
  function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = 'Eliminar',
    cancelText = 'Cancelar',
    isDestructive = true
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    title: string; 
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }) {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0f0f0f] border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDestructive ? 'bg-red-500/10' : 'bg-purple-500/10'
            }`}>
              <Trash2 className={`w-6 h-6 ${isDestructive ? 'text-red-400' : 'text-purple-400'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-zinc-400">{message}</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-white/10"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={`flex-1 ${
                isDestructive 
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Componente interno para el tab de Historial
  function HistoryTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState<{isOpen: boolean; chatId?: string; count?: number}>({ 
      isOpen: false 
    });
    const navigate = useNavigate();

    const filteredChats = chats.filter(chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAll = () => {
      if (selectedChats.size === filteredChats.length) {
        setSelectedChats(new Set());
      } else {
        setSelectedChats(new Set(filteredChats.map(c => c.id)));
      }
    };

    const handleSelectChat = (chatId: string) => {
      const newSelected = new Set(selectedChats);
      if (newSelected.has(chatId)) {
        newSelected.delete(chatId);
      } else {
        newSelected.add(chatId);
      }
      setSelectedChats(newSelected);
    };

    const handleDeleteSelected = () => {
      setDeleteModal({ isOpen: true, count: selectedChats.size });
    };

    const confirmDeleteSelected = async () => {
      for (const chatId of selectedChats) {
        await deleteChat(chatId);
      }
      setSelectedChats(new Set());
      setDeleteModal({ isOpen: false });
    };

    const handleDeleteChat = (chatId: string) => {
      setDeleteModal({ isOpen: true, chatId });
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Historial de Chats</h2>
          <p className="text-zinc-400">
            Gestiona tus conversaciones. Puedes eliminarlas individualmente o en grupo.
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-white/20 focus:outline-none transition-all"
            />
          </div>
          {selectedChats.size > 0 && (
            <Button
              onClick={handleDeleteSelected}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar ({selectedChats.size})
            </Button>
          )}
        </div>

        {/* Chat List */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 bg-zinc-900/50">
            <input
              type="checkbox"
              checked={selectedChats.size === filteredChats.length && filteredChats.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-white/20 bg-zinc-800 text-purple-600 focus:ring-purple-600/20"
            />
            <span className="text-sm font-medium text-zinc-400 flex-1">Título</span>
            <span className="text-sm font-medium text-zinc-400 w-32">Fecha</span>
            <span className="text-sm font-medium text-zinc-400 w-16">Acciones</span>
          </div>

          {/* List */}
          <div className="divide-y divide-white/5">
            {filteredChats.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No hay conversaciones</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={selectedChats.has(chat.id)}
                    onChange={() => handleSelectChat(chat.id)}
                    className="w-4 h-4 rounded border-white/20 bg-zinc-800 text-purple-600 focus:ring-purple-600/20"
                  />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => {
                        navigate(`/?chat=${chat.id}`);
                      }}
                      className="text-sm text-zinc-300 hover:text-white truncate text-left w-full flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      {chat.title}
                      <ExternalLink className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                  <span className="text-sm text-zinc-500 w-32">
                    {new Date(chat.updatedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <div className="w-16 flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleDeleteChat(chat.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal de Confirmación */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false })}
          onConfirm={deleteModal.chatId ? 
            async () => { 
              await deleteChat(deleteModal.chatId!); 
              setDeleteModal({ isOpen: false }); 
            } : 
            confirmDeleteSelected
          }
          title={deleteModal.chatId ? "Eliminar conversación" : `Eliminar ${deleteModal.count} conversaciones`}
          message={deleteModal.chatId ? 
            "¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer." : 
            `¿Estás seguro de que quieres eliminar ${deleteModal.count} conversaciones? Esta acción no se puede deshacer.`
          }
          confirmText="Eliminar"
          cancelText="Cancelar"
          isDestructive={true}
        />
      </div>
    );
  }

  // Placeholder para API Keys
  function ApiKeysPlaceholder() {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
          <Key className="w-8 h-8 text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">API Keys</h2>
        <p className="text-zinc-400 text-center max-w-md mb-6">
          Usa tus propias API keys para modelos seleccionados. 
          Esta función estará disponible próximamente.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg text-sm border border-amber-500/20">
          <Sparkles className="w-4 h-4" />
          Próximamente
        </div>
      </div>
    );
  }

  // Placeholder para Attachments
  function AttachmentsPlaceholder() {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
          <Paperclip className="w-8 h-8 text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Adjuntos</h2>
        <p className="text-zinc-400 text-center max-w-md mb-6">
          Gestiona tus archivos subidos y adjuntos. 
          Esta función estará disponible próximamente.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg text-sm border border-amber-500/20">
          <Sparkles className="w-4 h-4" />
          Próximamente
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Volver al Chat</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            {/* User Profile Card */}
            <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/20">
                  {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">
                    {user?.name ?? 'Usuario'}
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)] truncate">{user?.email}</p>
                  <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getTierColor().replace('text-', 'from-').replace('400', '500')}/20 ${getTierColor()} border border-current/20`}>
                    <Sparkles className="w-3 h-3" />
                    {getTierDisplay()}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Command className="w-4 h-4 text-[var(--text-tertiary)]" />
                Uso de Mensajes
              </h3>
              {statsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : usageStats ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--text-secondary)]">Hoy</span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {usageStats.todayMessages}/{usageStats.limits.messagesPerDay}
                      </span>
                    </div>
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
                        style={{
                          width: `${Math.min((usageStats.todayMessages / usageStats.limits.messagesPerDay) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-2">
                      {Math.max(0, usageStats.limits.messagesPerDay - usageStats.todayMessages)} mensajes restantes
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-2">
                  No se pudieron cargar las estadísticas
                </p>
              )}
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Atajos de Teclado</h3>
              <div className="space-y-3">
                {[
                  { label: 'Buscar', keys: ['Ctrl', 'K'] },
                  { label: 'Nuevo Chat', keys: ['Ctrl', 'Shift', 'O'] },
                  { label: 'Toggle Sidebar', keys: ['Ctrl', 'B'] },
                ].map((shortcut) => (
                  <div key={shortcut.label} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">{shortcut.label}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={key}>
                          <kbd className="px-1.5 py-0.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && <span className="text-zinc-600"></span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Navigation Tabs */}
            <div className="mb-6 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-xl min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                        ${activeTab === tab.id
                          ? 'bg-white/10 text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Component */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--bg-secondary)]/30 border border-[var(--border-subtle)] rounded-2xl p-6"
            >
              <ActiveComponent />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
