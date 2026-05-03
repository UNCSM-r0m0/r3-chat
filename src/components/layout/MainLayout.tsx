import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Square, PanelLeft, Sun, Moon, Terminal } from 'lucide-react';
import { SandboxPanel } from '../ui/SandboxPanel';
import { useChat } from '../../hooks/useChat';
import { Sidebar } from '../chat/Sidebar';
import { ChatInput } from '../chat/ChatInput';
import ChatArea from '../chat/ChatArea';
import { WelcomeScreen } from '../chat/WelcomeScreen';
import { type ChatMessage } from '../ui/MessageBubble';
import { useModelStore } from '../../stores/modelStore';
import { useThemeStore } from '../../stores/themeStore';

const ModelSelector = lazy(async () => {
  const module = await import('../chat/ModelSelector');
  return { default: module.ModelSelector };
});

interface MainLayoutProps {
  messages: ChatMessage[];
  onSend: (text: string, model?: string, fileIds?: string[]) => void;
  currentChatId?: string;
  isStreaming?: boolean;
  isConversationLoading?: boolean;
  conversationLoadingVariant?: 'default' | 'code' | 'math';
  inputDisabled?: boolean;
  disabledReason?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  messages,
  onSend,
  currentChatId,
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
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const selectedModel = useModelStore((state) => state.selectedModel);
  const selectModel = useModelStore((state) => state.selectModel);
  const { startNewChat } = useChat();
  const { resolvedTheme, toggleTheme } = useThemeStore();

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
        {/* Desktop Sidebar - Con animación suave */}
        <motion.div
          initial={false}
          animate={{
            width: sidebarOpen ? 260 : 0,
            opacity: sidebarOpen ? 1 : 0,
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 180,
            mass: 0.8,
          }}
          className="hidden md:block flex-shrink-0 h-full border-r border-[var(--border-subtle)] overflow-hidden"
        >
          <div className="w-[260px] h-full">
            <Sidebar
              isOpen={true}
              onToggle={() => setSidebarOpen(false)}
              isMobile={false}
            />
          </div>
        </motion.div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: mobileNavOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 180, mass: 0.8 }}
          className="fixed md:hidden top-0 left-0 z-50 h-full w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]"
        >
          <Sidebar
            isOpen={true}
            onToggle={() => setMobileNavOpen(false)}
            isMobile={true}
          />
        </motion.div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col relative bg-[var(--bg-primary)]">
          {/* Header Minimalista - Estilo T3 (sin borde) */}
          <header className="flex-shrink-0 flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              {/* Sidebar Toggle - Móvil */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
                aria-label="Abrir sidebar"
              >
                <PanelLeft className="w-4 h-4" strokeWidth={2} />
              </button>
              {/* Sidebar Toggle - Desktop */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:block p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
                aria-label={sidebarOpen ? "Cerrar sidebar" : "Abrir sidebar"}
              >
                {sidebarOpen ? (
                  <Square className="w-4 h-4" strokeWidth={2} />
                ) : (
                  <PanelLeft className="w-4 h-4" strokeWidth={2} />
                )}
              </button>

              {/* Logo minimalista */}
              <button
                onClick={() => startNewChat()}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="font-semibold text-sm tracking-tight">R3.chat</span>
              </button>
            </div>

            {/* Right actions - minimalistas */}
            <div className="flex items-center gap-1">
              {/* Theme Toggle - Minimalista */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
                aria-label={resolvedTheme === 'dark' ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {resolvedTheme === 'dark' ? (
                    <motion.div
                      key="moon"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Model Selector - Estilo pill */}
              <button
                onClick={() => setShowModels(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-white/[0.04] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="max-w-[100px] truncate">{selectedModel?.name || 'Modelos'}</span>
              </button>

              {/* Sandbox toggle */}
              <button
                onClick={() => setIsSandboxOpen(true)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
                aria-label="Abrir sandbox"
                title="Sandbox"
              >
                <Terminal className="w-4 h-4" />
              </button>

              {/* New Chat */}
              <button
                onClick={() => startNewChat()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/[0.04] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-colors"
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
                  style={{ paddingBottom: bottomPad + 96 }}
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

          {/* Input Area - Isla Flotante con Glassmorphism */}
          <div
            ref={inputWrapRef}
            className="flex-shrink-0 absolute bottom-0 left-0 right-0 z-20"
          >
            {/* Gradient fade - creates the blur effect where content passes underneath */}
            <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/95 to-transparent pointer-events-none" />

            {/* Input container with backdrop blur */}
            <div className="relative bg-[var(--bg-primary)]/80 backdrop-blur-xl pt-2 pb-4 px-4">
              <div className="mx-auto max-w-3xl">
                <ChatInput
                  onSendMessage={(text, model, fileIds) => onSend(text, model, fileIds)}
                  isStreaming={isStreaming}
                  disabled={inputDisabled}
                  disabledReason={disabledReason}
                />
              </div>
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

      {/* Sandbox Panel */}
      <SandboxPanel
        conversationId={currentChatId || 'global'}
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
