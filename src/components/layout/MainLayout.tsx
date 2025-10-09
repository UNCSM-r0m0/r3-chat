import React, { useState, useEffect } from 'react';
import { Sidebar, ChatArea, ModelSelector } from '../chat';
import { useModels } from '../../hooks/useModels';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

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
      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen && !isMobile ? 'ml-80' : 'ml-0'
      )}>
        <ChatArea />
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
