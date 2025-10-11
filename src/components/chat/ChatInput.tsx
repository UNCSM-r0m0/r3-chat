import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, Globe, Paperclip } from 'lucide-react';
import { useModels } from '../../hooks/useModels';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedModel } = useModels();

  // Auto-resize (hasta 200px)
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '0px';
    const next = Math.min(ta.scrollHeight, 200);
    ta.style.height = next + 'px';
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = message.trim();
    if (!text || isStreaming || disabled) return;
    onSendMessage(text, selectedModel?.id || 'gpt-4');
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter para enviar, Shift+Enter = nueva línea
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const prettyModelName = (id?: string) =>
    ({
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5',
      'claude-3': 'Claude 3',
      'deepseek-r1': 'DeepSeek R1',
      'deepseek-r1:7b': 'DeepSeek R1 7B',
    }[id ?? 'gpt-4'] ?? id ?? 'GPT-4');

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-10 sm:left-64
        bg-[color:var(--chat-input-bg,theme(colors.white/95))] dark:bg-[color:var(--chat-input-bg,theme(colors.gray.900/95))]
        backdrop-blur-md
      "
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="px-4 pt-3">
        <div className="mx-auto w-full max-w-3xl">
          <form
            id="chat-input-form"
            onSubmit={handleSubmit}
            className="
              pointer-events-auto relative flex w-full min-w-0 flex-col items-stretch gap-2
              rounded-t-xl border border-b-0 border-white/70 dark:border-[hsl(0,100%,83%)]/4
              bg-[--chat-input-background] px-3 pt-3
              outline-8 outline-[--chat-input-gradient]/50 outline-solid
              max-sm:pb-6
              shadow-[0_80px_50px_0_rgba(0,0,0,0.10),0_50px_30px_0_rgba(0,0,0,0.07),0_30px_15px_0_rgba(0,0,0,0.06),0_15px_8px_0_rgba(0,0,0,0.04),0_6px_4px_0_rgba(0,0,0,0.04),0_2px_2px_0_rgba(0,0,0,0.02)]
            "
            style={
              {
                // variables para el outline/gradiente y fondo (puedes ajustar colores)
                ['--chat-input-gradient' as any]:
                  'linear-gradient(180deg, rgba(168, 60, 144, .4), rgba(94, 77, 180, .35))',
                ['--chat-input-background' as any]:
                  'color-mix(in oklab, var(--color-white) 88%, transparent)',
              } as React.CSSProperties
            }
          >
            {/* oculto para accesibilidad */}
            <div className="hidden" />

            {/* Área de texto */}
            <div className="flex min-w-0 grow flex-row items-start">
              <textarea
                ref={textareaRef}
                name="input"
                id="chat-input"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming || disabled}
                className="
                  w-full min-w-0 resize-none bg-transparent
                  text-base leading-6 outline-none
                  text-foreground placeholder:text-secondary-foreground/60
                  disabled:opacity-50
                "
                aria-label="Message input"
                aria-describedby="chat-input-description"
                autoComplete="off"
                rows={1}
              />
              <div id="chat-input-description" className="sr-only">
                Press Enter to send, Shift + Enter for new line
              </div>
            </div>

            {/* Barra de acciones */}
            <div className="@container mt-2 -mb-px flex w-full min-w-0 flex-row-reverse justify-between">
              {/* Botón enviar */}
              <div
                className="-mt-0.5 -mr-0.5 flex shrink-0 items-center justify-center gap-2"
                aria-label="Message actions"
              >
                <button
                  type="submit"
                  disabled={!message.trim() || isStreaming || disabled}
                  aria-label="Send message"
                  className="
                    inline-flex size-9 items-center justify-center gap-2 rounded-lg p-2
                    text-pink-50 font-semibold
                    bg-[rgb(162,59,103)] hover:bg-[#d56698] active:bg-[rgb(162,59,103)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-sm
                  "
                >
                  <Send className="size-5" />
                </button>
              </div>

              {/* Model, Search, Attach */}
              <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      aria-label={`Select model. Current model: ${prettyModelName(
                        selectedModel?.id
                      )}`}
                      className="
                        h-8 relative flex max-w-[128px] min-w-0 items-center gap-1
                        rounded-md px-1 py-1.5 text-xs text-muted-foreground
                        hover:bg-muted/40 hover:text-foreground
                      "
                    >
                      <div className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                        {prettyModelName(selectedModel?.id)}
                      </div>
                      <ChevronDown className="size-4" />
                    </button>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      className="
                        h-8 gap-2 rounded-full border border-solid px-2
                        text-xs text-muted-foreground
                        hover:bg-muted/40 hover:text-foreground
                        @sm:px-2.5
                      "
                    >
                      <Globe className="h-4 w-4" />
                      <span className="hidden @md:block">Search</span>
                    </button>
                  </div>

                  <div className="shrink-0">
                    <label
                      className="
                        h-8 gap-2 rounded-full border border-solid px-2 py-1.5
                        text-xs text-muted-foreground
                        hover:bg-muted/40 hover:text-foreground
                        @sm:px-2.5
                        cursor-pointer
                      "
                    >
                      <input multiple type="file" className="sr-only" />
                      <Paperclip className="size-4" />
                      <span className="hidden @md:block">Attach</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Espaciador para que el input no tape el final del chat en pantallas pequeñas */}
          <div style={{ height: 'max(16px, env(safe-area-inset-bottom))' }} />
        </div>
      </div>
    </div>
  );
};