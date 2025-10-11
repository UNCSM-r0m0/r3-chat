import React, { useEffect, useRef, useState } from 'react';
import { Send, ChevronDown, Globe, Paperclip, Crown } from 'lucide-react';
import { useModels } from '../../hooks/useModels';
import { useAuthStore } from '../../stores/authStore';

interface ChatInputProps {
  onSendMessage: (message: string, model: string) => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming = false,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedModel, models, selectModel } = useModels();
  const { user } = useAuthStore();

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '0px';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
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

  // Verificar si el usuario puede usar modelos premium
  const canUsePremium = user?.subscription?.plan === 'pro' || user?.subscription?.plan === 'premium';
  
  // Filtrar modelos disponibles según el plan del usuario
  const availableModels = models.filter(model => 
    model.isAvailable && (!model.isPremium || canUsePremium)
  );

  const getModelDisplayName = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model?.name || modelId;
  };

  return (
    <div className="px-4 py-3 md:py-4 border-t bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="relative flex w-full min-w-0 flex-col items-stretch gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 pt-3 shadow-lg"
        >
          <div className="flex min-w-0 grow flex-row items-start">
            <textarea
              ref={textareaRef}
              id="chat-input"
              placeholder="Escribe tu mensaje…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              disabled={isStreaming || disabled}
              className="w-full min-w-0 max-h-[200px] resize-none bg-transparent text-base leading-6 outline-none disabled:opacity-50 text-foreground placeholder:text-muted-foreground"
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
                  className="flex items-center gap-2 px-3 py-2 bg-muted border rounded-lg text-sm hover:bg-muted/80 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${selectedModel?.isPremium ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <span className="truncate max-w-[100px]">
                    {selectedModel ? getModelDisplayName(selectedModel.id) : 'Seleccionar modelo'}
                  </span>
                  {selectedModel?.isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {/* Model Dropdown */}
                {showModelSelector && (
                  <div className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {availableModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          selectModel(model);
                          setShowModelSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-center justify-between ${
                          selectedModel?.id === model.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${model.isPremium ? 'bg-yellow-500' : 'bg-green-500'}`} />
                          <span className="text-sm">{model.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {model.isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                          {selectedModel?.id === model.id && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </button>
                    ))}
                    {availableModels.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No hay modelos disponibles
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button type="button" className="flex items-center gap-2 px-3 py-2 bg-muted border rounded-lg text-sm">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:block">Search</span>
              </button>
              <label className="flex items-center gap-2 px-3 py-2 bg-muted border rounded-lg text-sm cursor-pointer">
                <input multiple className="sr-only" type="file" />
                <Paperclip className="h-4 w-4" />
                <span className="hidden sm:block">Attach</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!message.trim() || isStreaming || disabled}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg text-white"
              aria-label="Enviar"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};