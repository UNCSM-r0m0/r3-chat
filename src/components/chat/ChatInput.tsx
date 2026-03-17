import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ChevronDown, 
  Globe, 
  Paperclip, 
  Crown,
  Loader2
} from 'lucide-react';
import { useModels } from '../../hooks/useModels';
import { useSubscription } from '../../hooks/useSubscription';
import type { AIModel } from '../../types';

interface ChatInputProps {
  onSendMessage: (message: string, model: string) => void;
  isStreaming?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming = false,
  disabled = false,
  disabledReason,
}) => {
  const [message, setMessage] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const { selectedModel, allModels, selectModel } = useModels();

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [message]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const send = () => {
    const text = message.trim();
    if (!text || isStreaming || disabled || !selectedModel) return;
    onSendMessage(text, selectedModel.id);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Filter available models
  const { canUsePremium } = useSubscription();
  const availableModels = allModels.filter((model: AIModel) => {
    const isAvailable = Boolean(model.available ?? model.isAvailable);
    const canUseThisPremium = !model.isPremium || canUsePremium;
    return isAvailable && canUseThisPremium;
  });

  const getModelDisplayName = (modelId: string) => {
    const model = allModels.find(m => m.id === modelId);
    return model?.name || modelId;
  };

  return (
    <div className="relative w-full">
      {/* Disabled notice */}
      <AnimatePresence>
        {disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 text-center"
          >
            {disabledReason || 'Has alcanzado tu límite de mensajes por día.'}
            <a href="/account" className="ml-2 underline hover:no-underline text-red-200">
              Ver planes
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input container */}
      <motion.div
        initial={false}
        animate={{ 
          boxShadow: message.length > 0 
            ? '0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.4)' 
            : '0 0 0 1px rgba(255,255,255,0.06)' 
        }}
        className="relative flex flex-col bg-[#111111] border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-200 focus-within:border-white/[0.12] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_20px_rgba(0,0,0,0.4)]"
      >
        {/* Textarea */}
        <div className="relative px-4 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            id="chat-input"
            placeholder={disabled ? 'Límite alcanzado...' : 'Escribe tu mensaje...'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                send(); 
              } 
            }}
            disabled={isStreaming || disabled}
            rows={1}
            className="w-full resize-none bg-transparent text-base text-zinc-100 placeholder:text-zinc-500 outline-none min-h-[24px] max-h-[200px] disabled:opacity-50"
            style={{ lineHeight: '1.5' }}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          {/* Left actions */}
          <div className="flex items-center gap-1.5">
            {/* Model Selector */}
            <div className="relative" ref={modelDropdownRef}>
              <motion.button
                type="button"
                onClick={() => setShowModelSelector(!showModelSelector)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] text-sm text-zinc-300 hover:text-white transition-all"
              >
                <div className={`w-2 h-2 rounded-full ${selectedModel?.isPremium ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="max-w-[100px] truncate">
                  {selectedModel ? getModelDisplayName(selectedModel.id) : 'Modelo'}
                </span>
                {selectedModel?.isPremium && <Crown className="w-3 h-3 text-amber-400" />}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* Model dropdown */}
              <AnimatePresence>
                {showModelSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-[100]"
                  >
                    <div className="max-h-64 overflow-y-auto py-1">
                      {availableModels.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            selectModel(model);
                            setShowModelSelector(false);
                          }}
                          className={`
                            w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors
                            ${selectedModel?.id === model.id 
                              ? 'bg-white/[0.08] text-white' 
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full ${model.isPremium ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                            <span>{model.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {model.isPremium && <Crown className="w-3 h-3 text-amber-400" />}
                            {selectedModel?.id === model.id && (
                              <motion.div 
                                layoutId="selected-indicator"
                                className="w-1.5 h-1.5 rounded-full bg-blue-500" 
                              />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search toggle */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Web</span>
            </motion.button>

            {/* Attach file */}
            <motion.label
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <input multiple className="sr-only" type="file" />
              <Paperclip className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Adjuntar</span>
            </motion.label>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Character count */}
            {message.length > 0 && (
              <span className="text-xs text-zinc-600">
                {message.length}
              </span>
            )}

            {/* Send button */}
            <motion.button
              type="button"
              onClick={send}
              disabled={!message.trim() || isStreaming || disabled}
              whileHover={message.trim() && !isStreaming ? { scale: 1.05 } : {}}
              whileTap={message.trim() && !isStreaming ? { scale: 0.95 } : {}}
              className={`
                flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
                ${message.trim() && !isStreaming && !disabled
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40' 
                  : 'bg-white/[0.04] text-zinc-600 cursor-not-allowed'
                }
              `}
              aria-label={isStreaming ? 'Procesando' : 'Enviar'}
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Hint text */}
      <p className="mt-2 text-center text-xs text-zinc-600">
        R3.chat puede cometer errores. Verifica información importante.
      </p>
    </div>
  );
};

export default ChatInput;
