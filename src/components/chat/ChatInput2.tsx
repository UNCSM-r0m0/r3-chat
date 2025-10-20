import React, { useEffect, useRef, useState } from 'react';
import { Send, ChevronDown, Globe, Paperclip, Crown } from 'lucide-react';
import { useModels } from '../../hooks/useModels';
import { useSubscription } from '../../hooks/useSubscription';

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
  const { selectedModel, models, selectModel } = useModels();

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '0px';
    ta.style.height = Math.min(ta.scrollHeight, 220) + 'px';
  }, [message]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showModelSelector && !target.closest('.model-selector')) {
        setShowModelSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelSelector]);

  const send = () => {
    const text = message.trim();
    if (!text || isStreaming || disabled || !selectedModel) return;
    onSendMessage(text, selectedModel.id);
    setMessage('');
  };

  // Suscripción para saber si puede usar premium
  const { canUsePremium } = useSubscription();
  const availableModels = models.filter((model: any) => {
    const isAvailable = Boolean(model.available ?? model.isAvailable);
    const canUseThisPremium = !model.isPremium || canUsePremium;
    return isAvailable && canUseThisPremium;
  });

  const getModelDisplayName = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model?.name || modelId;
  };

  return (
    <div className="py-3 md:py-4 bg-transparent">
      <div className="w-full">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className={[
            'relative flex w-full min-w-0 flex-col items-stretch gap-2',
            'rounded-2xl border border-white/10 bg-gray-700/60 backdrop-blur-sm',
            'px-3 pt-3 shadow-lg',
            disabled ? 'opacity-70 pointer-events-none' : '',
          ].join(' ')}
        >
          {disabled && (
            <div className="-mt-1 -mx-1 mb-1 px-3 py-2 text-xs rounded-lg bg-red-500/10 text-red-300 border border-red-500/20">
              {disabledReason || 'Has alcanzado tu límite de mensajes por día.'}
              <a href="/account" className="ml-2 underline hover:no-underline">Ver planes</a>
            </div>
          )}

          <div className="flex min-w-0 grow flex-row items-start">
            <textarea
              ref={textareaRef}
              id="chat-input"
              placeholder={disabled ? 'Límite alcanzado…' : 'Escribe tu mensaje...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              disabled={isStreaming || disabled}
              className="w-full min-w-0 max-h-[220px] resize-none bg-transparent text-base leading-6 outline-none disabled:opacity-70 text-white placeholder:text-gray-400"
              autoComplete="off"
              rows={1}
            />
          </div>

          <div className="mt-1 mb-2 flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <div className="relative model-selector">
                <button 
                  type="button" 
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600/70 border border-white/10 rounded-lg text-sm text-white hover:bg-gray-600/90 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${selectedModel?.isPremium ? 'bg-yellow-400' : 'bg-green-400'}`} />
                  <span className="truncate max-w-[120px]">
                    {selectedModel ? getModelDisplayName(selectedModel.id) : 'Seleccionar modelo'}
                  </span>
                  {selectedModel?.isPremium && <Crown className="w-3 h-3 text-yellow-400" />}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showModelSelector && (
                  <div className="absolute bottom-full mb-2 left-0 w-64 bg-gray-800/90 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                    {availableModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          selectModel(model);
                          setShowModelSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-700/70 transition-colors flex items-center justify-between text-white ${
                          selectedModel?.id === model.id ? 'bg-gray-700/70' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${model.isPremium ? 'bg-yellow-400' : 'bg-green-400'}`} />
                          <span className="text-sm">{model.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {model.isPremium && <Crown className="w-3 h-3 text-yellow-400" />}
                          {selectedModel?.id === model.id && (
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                          )}
                        </div>
                      </button>
                    ))}
                    {availableModels.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-400">
                        No hay modelos disponibles
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button type="button" className="flex items-center gap-2 px-3 py-2 bg-gray-600/70 border border-white/10 rounded-lg text-sm text-white hover:bg-gray-600/90 transition-colors">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:block">Search</span>
              </button>
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-600/70 border border-white/10 rounded-lg text-sm text-white hover:bg-gray-600/90 transition-colors cursor-pointer">
                <input multiple className="sr-only" type="file" />
                <Paperclip className="h-4 w-4" />
                <span className="hidden sm:block">Attach</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!message.trim() || isStreaming || disabled}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={isStreaming ? 'Procesando' : 'Enviar'}
              title={isStreaming ? 'Procesando' : 'Enviar'}
            >
              {isStreaming ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;

