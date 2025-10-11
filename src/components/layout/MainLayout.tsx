import React, { useState } from 'react';
import { Plus, Search, Menu } from 'lucide-react';
import { Sidebar } from '../chat/Sidebar';
import { ChatArea } from '../chat/ChatArea';
import { ModelSelector } from '../chat/ModelSelector';
import { ChatInput } from '../chat/ChatInput';

/**
 * Layout responsivo a pantalla completa.
 * - Usa h-[100dvh] para móviles (evita safe-area bugs)
 * - min-h-0 en contenedores flex para permitir overflow del hijo scroll
 * - overflow-hidden en raíz y overflow-y-auto SOLO en el área de chat
 */
export const MainLayout: React.FC = () => {
  const [showModels, setShowModels] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

      <div className="h-[calc(100dvh-0px)] md:h-[100dvh] flex min-h-0">
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

        {/* Contenido principal */}
        <main className="flex-1 min-w-0 min-h-0 flex flex-col">
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

          {/* Área de chat (scroll SOLO aquí) */}
          <div className="flex-1 min-h-0 flex flex-col">
            <ChatArea />
            {/* Input sticky al fondo */}
            <ChatInput />
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