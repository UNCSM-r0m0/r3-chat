import React, { useState, useEffect } from 'react';
import { Sidebar, ChatArea, ModelSelector, ChatInput } from '../chat';
import { useModels } from '../../hooks/useModels';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { Search, Plus } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { selectedModel, selectModel } = useModels();
  const { chats, currentChat, startNewChat, selectChat, sendMessage, isStreaming, isLimitReached } = useChat();
  const { isAuthenticated } = useAuth();

  // Detectar si es móvil
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // En móvil, cerrar sidebar por defecto
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Cargar chats al montar para poblar el sidebar
  // useChat ya llama a loadChats() en su propio useEffect
  // Este bloque se asegura de crear uno si no hay

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSelectModel = (model: any) => {
    selectModel(model);
  };

  // Crear un chat inicial solo para usuarios anónimos
  useEffect(() => {
    if (!isAuthenticated && chats.length === 0 && !currentChat && selectedModel) {
      startNewChat();
    }
  }, [isAuthenticated, chats.length, currentChat, selectedModel, startNewChat]);

  // Si el usuario está autenticado y hay conversaciones, seleccionar la primera automáticamente
  useEffect(() => {
    if (isAuthenticated && chats.length > 0 && !currentChat) {
      selectChat(chats[0]);
    }
  }, [isAuthenticated, chats, currentChat, selectChat]);

  return (
    <div className="relative flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm sm:left-64">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 flex justify-between items-center">
          {/* Toggle Button for Mobile */}
          <button
            onClick={handleToggleSidebar}
            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 transition-colors"
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center ps-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              R3.chat
            </span>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button 
              onClick={() => startNewChat()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={handleToggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col mt-14 transition-all duration-300 sm:ml-64 h-full">
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatArea />
        </main>
      </div>

      {/* Chat Input Component - Fixed */}
      <ChatInput
        onSendMessage={async (message: string, _model: string) => {
          try {
            await sendMessage(message);
          } catch (error) {
            console.error('Error sending message:', error);
          }
        }}
        isStreaming={isStreaming}
        disabled={isLimitReached}
      />

      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={handleToggleSidebar}
        />
      )}

      {/* Model Selector Modal */}
      <ModelSelector
        isOpen={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
        onSelectModel={handleSelectModel}
        selectedModel={selectedModel}
      />
    </div>
  );
};
