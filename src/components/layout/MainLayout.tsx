import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Menu, Sparkles, PanelLeft, PanelLeftClose } from 'lucide-react';
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
    <div className="h-[100dvh] w-full overflow-hidden bg-[#0a0a0a] text-white">
      <div className="h-full flex min-h-0">
        {/* Desktop Sidebar - Solo se renderiza cuando está abierto */}
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden md:block flex-shrink-0 h-full"
          >
            <Sidebar 
              isOpen={true} 
              onToggle={() => setSidebarOpen(false)}
              isMobile={false}
            />
          </motion.div>
        )}

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: mobileNavOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed md:hidden top-0 left-0 z-50 h-full w-72"
        >
          <Sidebar 
            isOpen={true}
            onToggle={() => setMobileNavOpen(false)}
            isMobile={true}
          />
        </motion.div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col relative">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 flex items-center justify-between px-4 md:px-4 py-3 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl z-20"
          >
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                aria-label="Abrir menú"
              >
                <Menu size={18} />
              </motion.button>

              {/* Sidebar toggle (desktop) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex p-2 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
              >
                {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
              </motion.button>

              {/* Title - Click to go to welcome page */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startNewChat()}
                className="flex items-center gap-2 p-1.5 -m-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-zinc-800 to-black rounded-lg flex items-center justify-center border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-white tracking-tight">R3.chat</span>
              </motion.button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModels(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.1] text-zinc-300 hover:text-white transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {selectedModel?.name || 'Modelos'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.1] text-zinc-300 hover:text-white transition-all"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Nuevo</span>
              </motion.button>
            </div>
          </motion.header>

          {/* Chat Area or Welcome Screen */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {!hasMessages && !isConversationLoading ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
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
          <motion.div 
            ref={inputWrapRef} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0 relative z-10"
          >
            <div className="mx-auto max-w-3xl px-4 md:px-6 py-4">
              <ChatInput
                onSendMessage={(text, model) => onSend(text, model)}
                isStreaming={isStreaming}
                disabled={inputDisabled}
                disabledReason={disabledReason}
              />
            </div>
          </motion.div>
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
