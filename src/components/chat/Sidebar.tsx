import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  LogOut, 
  Trash2, 
  Settings, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  Shield,
  FileText
} from 'lucide-react';
import { Input } from '../ui';
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

  // Agrupar chats por fecha (estilo T3)
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

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 },
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen || !isMobile ? 'open' : 'closed'}
        variants={sidebarVariants}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 z-50 h-full w-72 bg-[#0a0a0a] border-r border-white/[0.06] md:relative"
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-lg opacity-20 group-hover:opacity-30 transition-opacity rounded-full" />
                <div className="relative w-8 h-8 bg-gradient-to-br from-zinc-800 to-black rounded-lg flex items-center justify-center border border-white/10">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">R3.chat</span>
            </Link>
            
            {/* Close button for mobile and desktop */}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
            >
              {isMobile ? <ChevronLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>

          {/* New Chat Button */}
          <div className="px-4 py-4">
            <motion.button
              onClick={handleNewChat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.12] rounded-xl text-white font-medium transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva conversación</span>
            </motion.button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-400 transition-colors" />
              <Input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border-white/[0.06] focus:border-white/[0.12] rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 transition-all"
              />
            </div>
          </div>

          {/* Chat List - Agrupado por fecha estilo T3 */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin">
            {filteredChats.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">
                  {searchQuery ? 'No se encontraron chats' : 'No hay conversaciones aún'}
                </p>
              </div>
            ) : (
              groupedChats.map((group, groupIndex) => (
                <div key={group.label} className="space-y-1">
                  {/* Group label */}
                  <div className="px-3 py-1.5">
                    <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                  {/* Group chats */}
                  {group.chats.slice(0, 20).map((chat, index) => (
                    <motion.button
                      key={chat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (groupIndex * 0.1) + (index * 0.03) }}
                      onClick={() => handleSelectChat(chat)}
                      className={`
                        w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                        ${currentChat?.id === chat.id 
                          ? 'bg-white/[0.08] text-white' 
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                        }
                      `}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{chat.title}</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.button>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-white/[0.06]">
            {isAuthenticated ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.name ?? user?.email}
                    </p>
                    <p className={`text-xs font-medium ${getTierColor()}`}>
                      {getTierDisplay()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to="/account"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Cuenta</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Salir</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-zinc-500 text-center">
                  Inicia sesión para guardar tus conversaciones
                </p>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Iniciar sesión</span>
                </Link>
              </div>
            )}

            {/* Legal Links */}
            <div className="pt-3 mt-3 border-t border-white/[0.04]">
              <div className="flex items-center justify-center gap-4 mb-2">
                <Link 
                  to="/privacy" 
                  className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors"
                >
                  <Shield className="w-3 h-3" />
                  Privacidad
                </Link>
                <span className="text-zinc-700">·</span>
                <Link 
                  to="/terms" 
                  className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  Términos
                </Link>
              </div>
              <p className="text-[10px] text-zinc-600 text-center">
                © {new Date().getFullYear()} R3.chat
              </p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Toggle button for desktop (when sidebar is closed) */}
      {!isMobile && !isOpen && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onToggle}
          className="fixed left-4 top-4 z-30 p-2 rounded-lg bg-zinc-900/80 border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
};

export default Sidebar;
