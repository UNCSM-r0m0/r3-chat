import React, { useEffect, useRef, useState } from "react";
import { Plus, Search, Menu } from 'lucide-react';
import { Sidebar } from '../chat/Sidebar';
import { ChatInput } from '../chat/ChatInput2';
import ChatArea from '../chat/ChatArea';
import { type ChatMessage } from '../ui/MessageBubble';
import { ModelSelector } from '../chat/ModelSelector';

interface MainLayoutProps {
  messages: ChatMessage[];
  onSend: (text: string, model?: string) => void;
  isStreaming?: boolean;
  inputDisabled?: boolean;
  disabledReason?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  messages,
  onSend,
  isStreaming = false,
  inputDisabled = false,
  disabledReason,
}) => {
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const [bottomPad, setBottomPad] = useState(96);
  const [showModels, setShowModels] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ResizeObserver para medir altura del input
  useEffect(() => {
    if (!inputWrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (inputWrapRef.current) {
        setBottomPad(inputWrapRef.current.offsetHeight);
      }
    });
    ro.observe(inputWrapRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-gray-900 text-white">
      <div className="h-full flex min-h-0">
        {/* Overlay para sidebar móvil */}
        {mobileNavOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setMobileNavOpen(false)} 
          />
        )}

        <aside
          className={[
            "fixed top-0 left-0 h-full w-72 bg-gray-900 z-50 transition-transform duration-300 ease-in-out",
            "md:static md:translate-x-0 md:z-auto",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <Sidebar 
            isOpen={mobileNavOpen} 
            onToggle={() => setMobileNavOpen(!mobileNavOpen)}
            isMobile={true}
          />
        </aside>

        <main className="flex-1 min-w-0 flex flex-col bg-gray-800 relative">
          <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-3">
              {/* Botón menú móvil */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-2 rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors"
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

          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatArea 
              messages={messages} 
              isStreaming={isStreaming} 
              bottomPadding={bottomPad + 8} 
              onResend={(text) => onSend(text)}
            />
          </div>

          <div ref={inputWrapRef} className="flex-shrink-0 bg-gray-800 relative z-10">
            <div className="mx-auto max-w-4xl px-4 md:px-6 py-4">
              <ChatInput
                onSendMessage={(text, model) => onSend(text, model)}
                isStreaming={isStreaming}
                disabled={inputDisabled}
                disabledReason={disabledReason}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modal de selección de modelos */}
      <ModelSelector
        isOpen={showModels}
        onClose={() => setShowModels(false)}
        onSelectModel={() => setShowModels(false)}
        selectedModel={null}
      />
    </div>
  );
};
