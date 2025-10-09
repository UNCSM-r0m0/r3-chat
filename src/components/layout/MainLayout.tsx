import React, { useState, useEffect } from 'react';
import { Sidebar, ChatArea, ModelSelector } from '../chat';
import { useModels } from '../../hooks/useModels';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const { selectedModel, selectModel } = useModels();
  const { chats, currentChat, startNewChat, selectChat } = useChat();
  const { isAuthenticated } = useAuth();

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
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={handleToggleSidebar} 
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'ml-80' : 'ml-16'
      }`}>
        <ChatArea />
      </div>

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
