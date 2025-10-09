import React, { useState, useEffect } from 'react';
import { Plus, Search, LogIn, Trash2, Menu, X } from 'lucide-react';
import { Button, Input } from '../ui';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../helpers/format';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { chats, currentChat, startNewChat, selectChat, deleteChat, loadChats } = useChat();
  // Cargar historial cuando se abre (especialmente en móvil)
  useEffect(() => {
    if (isOpen && chats.length === 0) {
      loadChats();
    }
  }, [isOpen, chats.length, loadChats]);
  const { user, isAuthenticated, logout } = useAuth();

  // Responsivo: el padre controla isMobile; no necesitamos listener aquí

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = async () => {
    await startNewChat();
    if (isMobile) onToggle();
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar este chat?')) {
      await deleteChat(chatId);
    }
  };

  if (!isOpen) {
    // Siempre mostrar rail mínimo con botón hamburguesa
    return (
      <div className="fixed left-0 top-0 z-40 h-full w-16 bg-gray-950 border-r border-gray-800">
        <div className="flex flex-col items-center py-4">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-full bg-gray-950 border-r border-gray-800 flex flex-col transition-all duration-300",
      isMobile ? "w-full" : "w-72"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">R3.chat</h1>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        
        <Button
          onClick={handleNewChat}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          + New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <Input
          placeholder="Q Search your threads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            {searchQuery ? 'No se encontraron chats' : 'No hay chats aún'}
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => { selectChat(chat); if (isMobile) onToggle(); }}
                className={cn(
                  'group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                  currentChat?.id === chat.id
                    ? 'bg-purple-600 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                )}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{chat.title}</h3>
                  {chat.messages && chat.messages.length > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-400 truncate mt-0.5">
                      {chat.messages[chat.messages.length - 1]?.content}
                    </p>
                  )}
                  <p className="text-xs opacity-75 mt-1">
                    {formatDate(chat.updatedAt)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="p-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name ?? user?.email}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <LogIn className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            leftIcon={<LogIn className="h-4 w-4" />}
          >
            Login
          </Button>
        )}
      </div>
    </div>
  );
};
