import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Square, PanelLeft } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { Sidebar } from '../chat/Sidebar';
import { ChatInput } from '../chat/ChatInput';
import ChatArea from '../chat/ChatArea';
import { WelcomeScreen } from '../chat/WelcomeScreen';
import { type ChatMessage } from '../ui/MessageBubble';
import { useModelStore } from '../../stores/modelStore';

const ModelSelector = lazy(async () => {
  const module = await import('../chat/ModelSelector');
  return { default: module.ModelSelector };
});

interface MainLayoutProps {
  messages: ChatMessage[];
  onSend: (text: string, model?: string) => void;
  isStreaming?: boolean;
  isConversationLoading?: boolean;
  conversationLoadingVariant?: 'default' | 'code' | 'math';
  inputDisabled?: boolean;
  disabledReason?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  messages,
  onSend,
  isStreaming = false,
  isConversationLoading = false,
  conversationLoadingVariant = 'default',
  inputDisabled = false,
  disabledReason,
}) => {
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const [bottomPad, setBottomPad] = useState(120);
  const [showModels, setShowModels] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const selectedModel = useModelStore((state) => state.selectedModel);
  const selectModel = useModelStore((state) => state.selectModel);
  const { startNewChat } = useChat();

  const hasMessages = messages.length > 0;

  // ResizeObserver for input height
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

  const handlePromptClick = (prompt: string) => {
    onSend(prompt);
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="h-full flex min-h-0">
        {/* Desktop Sidebar */}
        <AnimatePresence mode="popLayout">
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="hidden md:block flex-shrink-0 h-full border-r border-[var(--border-subtle)]"
            >
              <Sidebar 
                isOpen={true} 
                onToggle={() => setSidebarOpen(false)}
                isMobile={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: mobileNavOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 250 }}
          className="fixed md:hidden top-0 left-0 z-50 h-full w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]"
        >
          <Sidebar 
            isOpen={true}
            onToggle={() => setMobileNavOpen(false)}
            isMobile={true}
          />
        </motion.div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col relative">
          {/* Header Minimalista - Estilo T3 */}
          <header className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              {/* Sidebar Toggle - Icono simple cuadrado */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                aria-label={sidebarOpen ? "Cerrar sidebar" : "Abrir sidebar"}
              >
                {sidebarOpen ? (
                  <Square className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  <PanelLeft className="w-4 h-4" strokeWidth={2.5} />
                )}
              </button>

              {/* Logo minimalista */}
              <button
                onClick={() => startNewChat()}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
                <span className="font-semibold text-sm tracking-tight">R3.chat</span>
              </button>
            </div>

            {/* Right actions - minimalistas */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowModels(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {selectedModel?.name || 'Modelos'}
              </button>

              <button
                onClick={() => startNewChat()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            </div>
          </header>

          {/* Chat Area or Welcome Screen */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {!hasMessages && !isConversationLoading ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto"
                >
                  <WelcomeScreen onPromptClick={handlePromptClick} />
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <ChatArea 
                    messages={messages} 
                    isStreaming={isStreaming} 
                    isConversationLoading={isConversationLoading}
                    loadingVariant={conversationLoadingVariant}
                    bottomPadding={bottomPad + 24} 
                    onResend={(text) => onSend(text)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div 
            ref={inputWrapRef} 
            className="flex-shrink-0 relative z-10 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]"
          >
            <div className="mx-auto max-w-3xl px-4 py-4">
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

      {/* Model Selector Modal */}
      <AnimatePresence>
        {showModels && (
          <Suspense fallback={null}>
            <ModelSelector
              isOpen={showModels}
              onClose={() => setShowModels(false)}
              onSelectModel={(model) => {
                selectModel(model);
                setShowModels(false);
              }}
              selectedModel={selectedModel}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
