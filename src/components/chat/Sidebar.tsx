import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  LogOut, 
  Trash2, 
  Settings, 
  MessageSquare,
  Sparkles,
  Shield,
  FileText,
  User
} from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { isToday, isYesterday, isWithinLast7Days } from '../../helpers/format';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { chats, currentChat, startNewChat, selectChat, deleteChat, loadChats } = useChat();
  const { user, isAuthenticated, logout } = useAuth();
  const { getTierDisplay, getTierColor } = useSubscription();
  
  useEffect(() => {
    if (isOpen && chats.length === 0) {
      loadChats();
    }
  }, [isOpen, chats.length, loadChats]);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agrupar chats por fecha
  const groupedChats = React.useMemo(() => {
    const groups: { label: string; chats: typeof filteredChats }[] = [];
    
    const todayChats = filteredChats.filter(c => isToday(new Date(c.updatedAt)));
    const yesterdayChats = filteredChats.filter(c => isYesterday(new Date(c.updatedAt)));
    const last7DaysChats = filteredChats.filter(c => {
      const date = new Date(c.updatedAt);
      return isWithinLast7Days(date) && !isToday(date) && !isYesterday(date);
    });
    const olderChats = filteredChats.filter(c => {
      const date = new Date(c.updatedAt);
      return !isToday(date) && !isYesterday(date) && !isWithinLast7Days(date);
    });

    if (todayChats.length > 0) groups.push({ label: 'Hoy', chats: todayChats });
    if (yesterdayChats.length > 0) groups.push({ label: 'Ayer', chats: yesterdayChats });
    if (last7DaysChats.length > 0) groups.push({ label: 'Últimos 7 días', chats: last7DaysChats });
    if (olderChats.length > 0) groups.push({ label: 'Anteriores', chats: olderChats });

    return groups;
  }, [filteredChats]);

  const handleNewChat = async () => {
    await startNewChat();
    if (isMobile) onToggle();
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteChat(chatId);
  };

  const handleSelectChat = (chat: typeof chats[0]) => {
    selectChat(chat);
    if (isMobile) onToggle();
  };

  return (
    <aside className="h-full flex flex-col bg-[var(--bg-secondary)]">
      {/* Header - Solo logo y nuevo chat */}
      <div className="flex items-center justify-between px-3 py-3">
        <Link to="/" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">R3.chat</span>
        </Link>
        
        <button
          onClick={handleNewChat}
          className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Nueva conversación"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-hover)] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {filteredChats.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MessageSquare className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
            <p className="text-xs text-[var(--text-muted)]">
              {searchQuery ? 'No se encontraron chats' : 'No hay conversaciones'}
            </p>
          </div>
        ) : (
          groupedChats.map((group) => (
            <div key={group.label} className="space-y-0.5">
              {/* Group label */}
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
              {/* Group chats */}
              {group.chats.slice(0, 20).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`
                    w-full group flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all duration-150
                    ${currentChat?.id === chat.id 
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:shadow-sm'
                    }
                  `}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                  <span className="flex-1 min-w-0 truncate font-medium">{chat.title}</span>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 md:p-1.5 rounded-md bg-red-500/10 md:bg-transparent text-red-500 md:text-[var(--text-muted)] md:hover:text-red-400 md:hover:bg-red-500/10 transition-all"
                    aria-label="Eliminar chat"
                  >
                    <Trash2 className="w-4 h-4 md:w-3 md:h-3" />
                  </button>
                </button>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer - User Section */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        {isAuthenticated ? (
          <div className="space-y-2">
            {/* User Info */}
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-[var(--bg-tertiary)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-semibold">
                {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {user?.name ?? user?.email}
                </p>
                <p className={`text-[10px] ${getTierColor()}`}>
                  {getTierDisplay()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              <Link
                to="/account"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Cuenta</span>
              </Link>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-muted)] text-center">
              Inicia sesión para guardar tus conversaciones
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-white text-sm font-medium transition-all"
            >
              <User className="w-4 h-4" />
              <span>Iniciar sesión</span>
            </Link>
          </div>
        )}

        {/* Legal Links */}
        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-[var(--border-subtle)]">
          <Link 
            to="/privacy" 
            className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <Shield className="w-3 h-3" />
            Privacidad
          </Link>
          <span className="text-[var(--border-default)]">·</span>
          <Link 
            to="/terms" 
            className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <FileText className="w-3 h-3" />
            Términos
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
