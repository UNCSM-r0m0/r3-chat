import React, { useEffect, useRef, useState } from "react";
import { Plus, Search, Menu } from 'lucide-react';
import { Sidebar } from '../chat/Sidebar';
import { ChatInput } from '../chat/ChatInput';
import { ChatArea } from '../chat/ChatArea';
import { ModelSelector } from '../chat/ModelSelector';

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean; // opcional: cuando está llegando en stream
}

interface MainLayoutProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isStreaming?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  messages,
  onSend,
  isStreaming = false,
}) => {
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const [inputH, setInputH] = useState(128); // fallback razonable
  const [showModels, setShowModels] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Observa el alto real del formulario para usarlo como padding-bottom del área scrolleable
  useEffect(() => {
    const node = document.getElementById("chat-input-form");
    if (!node) return;

    // mide y actualiza
    const measure = () => setInputH(node.getBoundingClientRect().height + 20); // + margen extra
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      {/* Header móvil */}
      <header className="flex md:hidden items-center justify-between px-3 py-2 border-b">
        <button
          onClick={() => setMobileNavOpen(v => !v)}
          className="p-2 rounded-lg border hover:bg-muted"
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>
        <div className="font-medium">R3.chat</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModels(true)}
            className="p-2 rounded-lg border hover:bg-muted"
            aria-label="Seleccionar modelo"
          >
            <Search size={18} />
          </button>
          <button className="p-2 rounded-lg border hover:bg-muted" aria-label="Nuevo chat">
            <Plus size={18} />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100dvh-0px)] md:h-[100dvh] min-h-0">
        {/* Sidebar: visible en md+, deslizable en móvil */}
        <aside
          className={[
            'z-20 md:static md:translate-x-0 md:w-72 md:flex',
            'fixed inset-y-0 left-0 w-72 bg-background border-r transition-transform',
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
        <main className="flex-1 min-w-0 min-h-0 flex flex-col relative">
          {/* Barra superior desktop */}
          <div className="hidden md:flex items-center justify-between px-4 py-3 border-b">
            <div className="font-semibold">R3.chat</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModels(true)}
                className="px-3 py-2 text-sm rounded-lg border hover:bg-muted"
              >
                <Search className="inline mr-2" size={16} />
                Modelos
              </button>
              <button className="px-3 py-2 text-sm rounded-lg border hover:bg-muted">
                <Plus className="inline mr-2" size={16} />
                Nuevo
              </button>
            </div>
          </div>

          {/* Área de chat scrolleable */}
          <div
            ref={scrollWrapRef}
            className="
              flex-1 min-h-0 overflow-y-auto overscroll-contain
              px-3 sm:px-6 pt-6
            "
            style={{ paddingBottom: inputH }}
            id="chat-scroll-area"
          >
            <ChatArea messages={messages} />
          </div>

          {/* Input fijo al bottom (ya mide su alto con el observer) */}
          <ChatInput
            onSendMessage={(text) => onSend(text)}
            isStreaming={isStreaming}
          />
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