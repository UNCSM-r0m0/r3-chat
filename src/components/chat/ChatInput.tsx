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
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 z-10">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative flex w-full min-w-0 flex-col items-stretch gap-2 rounded-t-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 pt-3 shadow-lg"
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
              className="w-full min-w-0 resize-none bg-transparent text-base leading-6 outline-none disabled:opacity-50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
          <div className="mt-2 flex w-full items-center justify-between gap-2">
            {/* Left Actions */}
            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                aria-label={`Select model. Current model: ${prettyModelName(selectedModel?.id || 'gpt-4')}`}
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="truncate max-w-[100px]">
                  {prettyModelName(selectedModel?.id || 'gpt-4')}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Search Button */}
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:block">Search</span>
              </button>

              {/* Attach Button */}
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm cursor-pointer">
                <input multiple className="sr-only" type="file" />
                <Paperclip className="h-4 w-4" />
                <span className="hidden sm:block">Attach</span>
              </label>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || isStreaming || disabled}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg text-white"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
