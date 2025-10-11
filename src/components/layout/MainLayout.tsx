import React, { useEffect, useRef, useState } from "react";
import { Plus, Search, Menu } from 'lucide-react';
import { Sidebar } from '../chat/Sidebar';
import { ChatInput } from '../chat/ChatInput';
import ChatArea from '../chat/ChatArea';
import { type ChatMessage } from '../ui/MessageBubble';
import { ModelSelector } from '../chat/ModelSelector';

interface MainLayoutProps {
  messages: ChatMessage[];
  onSend: (text: string, model: string) => void;
  isStreaming?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  messages,
  onSend,
  isStreaming = false,
}) => {
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const [bottomPad, setBottomPad] = useState(96);
  const [showModels, setShowModels] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ResizeObserver para medir altura del input
  useEffect(() => {
    if (!inputWrapRef.current) return;
    const ro = new ResizeObserver(() => {
      setBottomPad(inputWrapRef.current!.offsetHeight);
    });
    ro.observe(inputWrapRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-gray-800 dark:bg-gray-800 text-white">
      {/* Grid principal: sidebar + área principal */}
      <div className="h-full grid grid-cols-[auto,1fr] min-h-0 relative">
        {/* Overlay para sidebar móvil */}
        {mobileNavOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
        
        {/* Sidebar: visible en md+, deslizable en móvil */}
        <aside
          className={[
            'z-20 md:static md:translate-x-0 md:w-72 md:flex',
            'fixed top-0 left-0 w-72 h-full bg-gray-900 dark:bg-gray-900 transition-transform md:relative md:top-0 md:h-full',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
          onClick={() => setMobileNavOpen(false)}
        >
          <Sidebar 
            isOpen={mobileNavOpen} 
            onToggle={() => setMobileNavOpen(!mobileNavOpen)}
            isMobile={true}
          />
        </aside>

        {/* Columna principal */}
        <main className="flex-1 min-w-0 min-h-0 flex flex-col relative bg-gray-800 dark:bg-gray-800 z-0">
          {/* Header dentro del área principal - NO cubre el sidebar */}
          <header className="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-800 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Botón menú móvil */}
              <button
                onClick={() => setMobileNavOpen(v => !v)}
                className="md:hidden p-2 rounded-lg border border-gray-600 text-white hover:bg-gray-700"
                aria-label="Abrir menú"
              >
                <Menu size={18} />
              </button>
              <div className="font-semibold text-white">R3.chat</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModels(true)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                <Search className="inline mr-2" size={16} />
                Modelos
              </button>
              <button className="px-3 py-2 text-sm rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors">
                <Plus className="inline mr-2" size={16} />
                Nuevo
              </button>
            </div>
          </header>

          {/* Chat area scrolleable */}
          <ChatArea 
            messages={messages} 
            isStreaming={isStreaming} 
            bottomPadding={bottomPad + 8} 
          />

          {/* Input fijo al bottom - respeta límites del sidebar */}
          <div ref={inputWrapRef} className="sticky bottom-0 z-10 bg-gray-800 dark:bg-gray-800">
            <div className="mx-auto max-w-6xl px-6 md:px-12">
              <ChatInput
                onSendMessage={(text, model) => onSend(text, model)}
                isStreaming={isStreaming}
              />
            </div>
          </div>
        </main>
      </div>

      <ModelSelector
        isOpen={showModels}
        onClose={() => setShowModels(false)}
        onSelectModel={() => setShowModels(false)}
        selectedModel={null}
      />
    </div>
  );
};