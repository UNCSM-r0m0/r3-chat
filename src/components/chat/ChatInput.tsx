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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isStreaming && !disabled) {
      onSendMessage(message.trim(), selectedModel?.id || 'gpt-4');
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const prettyModelName = (modelId: string) => {
    const modelMap: { [key: string]: string } = {
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5',
      'claude-3': 'Claude 3',
      'deepseek-r1': 'DeepSeek R1',
      'deepseek-r1:7b': 'DeepSeek R1 7B',
    };
    return modelMap[modelId] || modelId;
  };


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0612]/95 backdrop-blur-md p-4 z-10">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="text-secondary-foreground pb-safe-offset-3 dark:bg-secondary/4.5 dark:outline-chat-background/40 pointer-events-auto relative flex w-full min-w-0 flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-white/70 bg-[#0a0612]/90 px-3 pt-3 outline-8 outline-purple-500/50 outline-solid max-sm:pb-6 sm:max-w-3xl dark:border-[hsl(0,100%,83%)]/4"
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 80px 50px 0px, rgba(0, 0, 0, 0.07) 0px 50px 30px 0px, rgba(0, 0, 0, 0.06) 0px 30px 15px 0px, rgba(0, 0, 0, 0.04) 0px 15px 8px, rgba(0, 0, 0, 0.04) 0px 6px 4px, rgba(0, 0, 0, 0.02) 0px 2px 2px'
          }}
        >
          {/* Hidden div for accessibility */}
          <div className="hidden"></div>
          
          {/* Text Input Area */}
          <div className="flex min-w-0 grow flex-row items-start">
            <textarea
              ref={textareaRef}
              name="input"
              id="chat-input"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isStreaming || disabled}
              className="text-foreground placeholder:text-secondary-foreground/60 w-full min-w-0 resize-none bg-transparent text-base leading-6 outline-none disabled:opacity-50"
              aria-label="Message input"
              aria-describedby="chat-input-description"
              autoComplete="off"
              style={{ height: '48px !important' }}
            />
            <div id="chat-input-description" className="sr-only">
              Press Enter to send, Shift + Enter for new line
            </div>
          </div>

          {/* Action Bar */}
          <div className="@container mt-2 -mb-px flex w-full min-w-0 flex-row-reverse justify-between">
            {/* Send Button */}
            <div className="-mt-0.5 -mr-0.5 flex shrink-0 items-center justify-center gap-2" aria-label="Message actions">
              <button
                type="submit"
                disabled={!message.trim() || isStreaming || disabled}
                className="focus-visible:ring-ring inline-flex items-center justify-center gap-2 text-sm whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-reflect button-reflect dark:bg-primary/20 dark:disabled:hover:bg-primary/20 dark:disabled:active:bg-primary/20 bg-[rgb(162,59,103)] font-semibold shadow-sm hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 size-9 relative rounded-lg p-2 text-pink-50"
                aria-label="Message requires text"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            {/* Left Actions */}
            <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
              <div className="flex min-w-0 items-center gap-2">
                {/* Model Selector */}
                <div className="min-w-0 flex-1">
                  <div aria-live="polite" aria-atomic="true" className="sr-only">
                    Model selector closed.
                  </div>
                  <button
                    type="button"
                    className="focus-visible:ring-ring justify-center font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:text-foreground/50 disabled:hover:bg-transparent h-8 rounded-md text-xs relative flex max-w-[128px] min-w-0 items-center gap-1 px-1 py-1.5 @sm:gap-2 @sm:px-2 @md:max-w-none text-muted-foreground"
                    aria-label={`Select model. Current model: ${prettyModelName(selectedModel?.id || 'gpt-4')}`}
                    aria-haspopup="listbox"
                    aria-expanded="false"
                  >
                    <div className="min-w-0 flex-1 text-left text-sm font-medium">
                      <div className="truncate">
                        {prettyModelName(selectedModel?.id || 'gpt-4')}
                      </div>
                    </div>
                    <ChevronDown className="right-0 size-4" />
                  </button>
                </div>

                {/* Search Button */}
                <button
                  type="button"
                  className="focus-visible:ring-ring inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:text-foreground/50 disabled:hover:bg-transparent text-xs border-secondary-foreground/10 text-muted-foreground h-8 gap-2 rounded-full border border-solid px-2 @sm:px-2.5"
                  aria-label="Enable search"
                >
                  <Globe className="h-4 w-4 scale-x-[-1]" />
                  <span className="hidden @md:block">Search</span>
                </button>

                {/* Attach Button */}
                <div className="shrink-0">
                  <label className="focus-visible:ring-ring inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:text-foreground/50 disabled:hover:bg-transparent text-xs cursor-pointer border-secondary-foreground/10 text-muted-foreground h-8 gap-2 rounded-full border border-solid px-2 @sm:px-2.5"
                    aria-label="Attach a file"
                  >
                    <input multiple className="sr-only" type="file" />
                    <div className="flex gap-1">
                      <Paperclip className="size-4" />
                      <span className="hidden @sm:ml-0.5 @md:block">Attach</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
