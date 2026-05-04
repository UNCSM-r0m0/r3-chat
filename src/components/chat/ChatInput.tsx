import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ChevronDown,
  Globe,
  Crown,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useModels } from '../../hooks/useModels';
import { useSubscription } from '../../hooks/useSubscription';
import { useFileStore } from '../../stores/fileStore';
import { useChatStore } from '../../stores/chatStore';
import { FileUploader } from '../ui/FileUploader';
import { AttachmentPreview } from '../ui/AttachmentPreview';
import type { AIModel } from '../../types';

interface ChatInputProps {
  onSendMessage: (message: string, model: string, fileIds?: string[], mode?: string) => void;
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
  const mode = useChatStore((state) => state.mode);
  const toggleMode = useChatStore((state) => state.toggleMode);
  const [message, setMessage] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const { selectedModel, allModels, selectModel } = useModels();
  const { canUsePremium } = useSubscription();
  const { files, isUploading, uploadFile, removeFile, clearFiles } = useFileStore();

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

  const handleFileSelect = async (fileList: FileList) => {
    const uploadPromises = Array.from(fileList).map((file) => uploadFile(file));
    await Promise.all(uploadPromises);
  };

  const hasNativeRegisteredModel = allModels.some((model) => Boolean(model.available ?? model.isAvailable) && !model.isPremium);
  const isTemporaryRegisteredFallback = (model: AIModel) => {
    const fingerprint = `${model.id} ${model.name} ${model.provider}`.toLowerCase();
    return !hasNativeRegisteredModel && (fingerprint.includes('ollama') || fingerprint.includes('qwen'));
  };
  const selectedModelAvailable = Boolean(selectedModel?.available ?? selectedModel?.isAvailable);
  const selectedModelAllowed = Boolean(selectedModel && (!selectedModel.isPremium || canUsePremium || isTemporaryRegisteredFallback(selectedModel)));
  const modelDisabledReason = !selectedModel
    ? 'No hay modelo seleccionado.'
    : !selectedModelAvailable
      ? 'Este modelo no está disponible ahora.'
      : !selectedModelAllowed
        ? 'Este modelo es Pro. Elegí un modelo registrado o actualizá tu plan.'
        : null;
  const canSend = !isStreaming && !disabled && !isUploading && !modelDisabledReason;

  const send = async () => {
    const text = message.trim();
    if ((!text && files.length === 0) || !canSend || !selectedModel) return;

    const fileIds = files.map((f) => f.id);
    onSendMessage(text, selectedModel.id, fileIds, mode);
    setMessage('');
    clearFiles();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Filter available models
  const availableModels = allModels.filter((model: AIModel) => {
    const isAvailable = Boolean(model.available ?? model.isAvailable);
    const canUseThisPremium = !model.isPremium || canUsePremium || isTemporaryRegisteredFallback(model);
    return isAvailable && canUseThisPremium;
  });

  const getModelDisplayName = (modelId: string) => {
    const model = allModels.find(m => m.id === modelId);
    return model?.name || modelId;
  };

  return (
    <div className="relative w-full" style={{ isolation: 'isolate' }}>
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

      <AnimatePresence>
        {!disabled && modelDisabledReason && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200 text-center"
          >
            {modelDisabledReason}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input container - Glassmorphism island */}
      <motion.div
        initial={false}
        animate={{
          boxShadow: message.length > 0 || files.length > 0
            ? '0 0 0 1px rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.4)'
            : '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.2)'
        }}
        className="relative flex flex-col bg-[var(--bg-secondary)]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl transition-all duration-300 focus-within:bg-[var(--bg-secondary)]/80 focus-within:border-white/[0.15] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4)]"
      >
        {/* Attachment chips */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pt-3 pb-0 flex flex-wrap gap-2"
            >
              {files.map((file) => (
                <AttachmentPreview key={file.id} file={file} onRemove={removeFile} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <div className="relative px-4 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            id="chat-input"
            placeholder={disabled ? 'Límite alcanzado...' : modelDisabledReason || (mode === 'website_agent' ? 'Describí la landing o sitio web que querés crear...' : 'Escribe tu mensaje...')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={isStreaming || disabled || Boolean(modelDisabledReason)}
            rows={1}
            className="w-full resize-none bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none min-h-[24px] max-h-[200px] disabled:opacity-50"
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
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
                    className="absolute bottom-full left-0 mb-2 w-64 bg-[var(--bg-tertiary)] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50"
                    style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.4)' }}
                  >
                    <div className="max-h-64 overflow-y-auto py-1">
                      {availableModels.length === 0 && (
                        <div className="px-3 py-3 text-sm text-[var(--text-muted)]">
                          No hay modelos registrados disponibles. Un admin debe marcar al menos uno como Registered.
                        </div>
                      )}
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
                              ? 'bg-white/[0.08] text-[var(--text-primary)]'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]'
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

            {/* Website Agent toggle */}
            <motion.button
              type="button"
              onClick={toggleMode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                mode === 'website_agent'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'hover:bg-white/[0.04] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
              title={mode === 'website_agent' ? 'Modo Agéntico activo' : 'Activar modo Agéntico'}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Agéntico</span>
            </motion.button>

            {/* Search toggle */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Web</span>
            </motion.button>

            {/* Attach file - solo si el modelo soporta visión */}
            <FileUploader 
              onFileSelect={handleFileSelect} 
              disabled={isUploading || isStreaming || disabled || !selectedModel?.supportsImages}
              title={!selectedModel?.supportsImages ? 'Este modelo no soporta archivos adjuntos' : undefined}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Character count */}
            {message.length > 0 && (
              <span className="text-xs text-[var(--text-muted)]">
                {message.length}
              </span>
            )}

            {/* Send button */}
            <motion.button
              type="button"
              onClick={send}
              disabled={!message.trim() || !canSend}
              whileHover={message.trim() && canSend ? { scale: 1.05 } : {}}
              whileTap={message.trim() && canSend ? { scale: 0.95 } : {}}
              className={`
                flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
                ${message.trim() && canSend
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                  : 'bg-white/[0.04] text-[var(--text-muted)] cursor-not-allowed'
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
      <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
        R3.chat puede cometer errores. Verifica información importante.
      </p>
    </div>
  );
};

export default ChatInput;
