import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, LogIn, Trash2, Settings } from 'lucide-react';
import { Button, Input } from '../ui';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../helpers/format';
import { apiService } from '../../services/api';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const { chats, currentChat, startNewChat, selectChat, deleteChat, loadChats } = useChat();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Cargar historial cuando se abre (especialmente en móvil)
  useEffect(() => {
    if (isOpen && chats.length === 0) {
      loadChats();
    }
  }, [isOpen, chats.length, loadChats]);

  // Cargar información de suscripción
  useEffect(() => {
    if (isAuthenticated) {
      loadSubscription();
    }
  }, [isAuthenticated]);

  const loadSubscription = async () => {
    try {
      const response = await apiService.getSubscription();
      if (response.success) {
        setSubscription(response.data);
      }
    } catch (error) {
      console.warn('Error cargando suscripción:', error);
    }
  };

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

  const getTierDisplay = () => {
    if (!subscription) return 'Free';
    
    switch (subscription.tier) {
      case 'PREMIUM':
        return 'Pro';
      case 'REGISTERED':
        return 'Registered';
      default:
        return 'Free';
    }
  };

  const getTierColor = () => {
    if (!subscription) return 'text-gray-500';
    
    switch (subscription.tier) {
      case 'PREMIUM':
        return 'text-purple-600 dark:text-purple-400';
      case 'REGISTERED':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 sm:hidden" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 bg-gray-900 dark:bg-gray-900 transition-all duration-300 w-64 overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
        style={{ height: "100vh" }}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full" style={{ paddingTop: "4rem" }}>
          {/* Header */}
          <div className="px-4 py-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">R3.chat</span>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="px-4 py-3">
            <Button
              onClick={handleNewChat}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search your threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Chat List - Sin scroll interno */}
          <div className="flex-1 px-2 py-4">
            <ul className="space-y-1">
              {filteredChats.length === 0 ? (
                <li className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                  {searchQuery ? 'No se encontraron chats' : 'No hay chats aún'}
                </li>
              ) : (
                filteredChats.slice(0, 8).map((chat) => (
                  <li key={chat.id}>
                    <button
                      onClick={() => {
                        selectChat(chat);
                        if (isMobile) onToggle();
                      }}
                      className={`flex items-center w-full px-3 py-2 text-gray-600 dark:text-gray-400 transition-all duration-150 rounded-md group hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 ${
                        currentChat?.id === chat.id
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                          : ""
                      }`}
                    >
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium truncate" title={chat.title}>{chat.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {formatDate(chat.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                      >
                        <Trash2 className="h-3 w-3 text-gray-400" />
                      </button>
                    </button>
                  </li>
                ))
              )}
              {filteredChats.length > 8 && (
                <li className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 text-xs">
                  ... y {filteredChats.length - 8} más
                </li>
              )}
            </ul>
          </div>

          {/* User Info */}
          <div className="px-4 py-3">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-medium">
                    {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name ?? user?.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <p className={`text-xs font-medium ${getTierColor()}`}>{getTierDisplay()}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to="/account"
                    className="flex-1 p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Account
                  </Link>
                  <button
                    onClick={logout}
                    className="flex-1 p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Inicia sesión para guardar tus conversaciones</p>
                <Link
                  to="/login"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white p-2 rounded-lg flex items-center justify-center transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </div>
            )}

            {/* Terms of Service */}
            <div className="mt-4 pt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              <p className="truncate">Al usar este servicio, aceptas nuestros</p>
              <button className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline truncate">
                Términos de Servicio
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
