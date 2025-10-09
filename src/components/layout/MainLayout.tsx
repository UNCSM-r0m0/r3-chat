import React, { useState, useEffect } from 'react';
import { Sidebar, ChatArea, ModelSelector } from '../chat';
import { useModels } from '../../hooks/useModels';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { Menu, Search, Plus } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { selectedModel, selectModel } = useModels();
  const { chats, currentChat, startNewChat, selectChat } = useChat();
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
    <div className="h-screen flex bg-gray-950">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={handleToggleSidebar} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar con blur cuando sidebar está cerrado */}
        {!sidebarOpen && (
          <div className="absolute top-0 left-0 right-0 z-20 h-16 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
            <div className="flex items-center justify-between h-full px-4">
              {/* Botones izquierda */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleSidebar}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <Menu className="h-5 w-5 text-gray-300" />
                </button>
                <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                  <Search className="h-5 w-5 text-gray-300" />
                </button>
                <button 
                  onClick={() => startNewChat()}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <Plus className="h-5 w-5 text-gray-300" />
                </button>
              </div>
              
              {/* Título centrado */}
              <div className="flex-1 text-center">
                <h1 className="text-lg font-semibold text-white">R3.chat</h1>
              </div>
              
              {/* Botones derecha */}
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                  <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                  <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                  <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat Area */}
        <div className={cn(
          "flex-1 transition-all duration-300",
          !sidebarOpen ? 'pt-16' : 'pt-0'
        )}>
          <ChatArea sidebarOpen={sidebarOpen} />
        </div>
      </div>

      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
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
