import React, { useState } from 'react';
import { Sidebar, ChatArea, ModelSelector } from '../chat';
import { useModels } from '../../hooks/useModels';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const { selectedModel, selectModel } = useModels();

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSelectModel = (model: any) => {
    selectModel(model);
  };

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
