import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';

const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'));

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp?: Date;
  model?: string;
};

type Props = { message: ChatMessage; onResend?: () => void };

const MessageBubble: React.FC<Props> = ({ message, onResend }) => {
  const isUser = message.role === 'user';
  const isErrorAssistant = !isUser && /Error al conectar|Servidor no responde|timeout|interrumpido/i.test(message.content || '');
  const isStreaming = message.id.startsWith('stream-') && (message.content || '').trim() === '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="w-full py-4"
      data-msg-id={message.id}
    >
      <div className={`
        flex items-start gap-4 max-w-3xl mx-auto
        ${isUser ? 'flex-row-reverse' : ''}
      `}>
        {/* Avatar - Solo visible para assistant (estilo T3) */}
        {!isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
          {/* Role label - Solo visible para assistant */}
          {!isUser && (
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">
                R3 Assistant
              </span>
              {message.timestamp && (
                <span className="text-xs text-zinc-600">
                  {formatTime(message.timestamp)}
                </span>
              )}
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`
              inline-block text-left max-w-full
              ${isUser 
                ? 'bg-[#1a1a2e] text-zinc-100' 
                : 'bg-transparent text-zinc-100'
              }
              ${isUser ? 'rounded-2xl rounded-tr-sm px-5 py-3' : 'px-0 py-1'}
            `}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                {message.content}
              </div>
            ) : (
              <div className="text-[15px] leading-7">
                {isStreaming ? (
                  <div className="flex items-center gap-1.5 py-2">
                    <span className="w-2 h-2 bg-zinc-500 rounded-full typing-dot" />
                    <span className="w-2 h-2 bg-zinc-500 rounded-full typing-dot" />
                    <span className="w-2 h-2 bg-zinc-500 rounded-full typing-dot" />
                  </div>
                ) : (
                  <Suspense fallback={
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  }>
                    <MarkdownRenderer content={message.content} />
                  </Suspense>
                )}
              </div>
            )}
          </div>

          {/* Error retry button */}
          {isErrorAssistant && onResend && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onResend}
              className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reintentar
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Format time helper
const formatTime = (dateTime: Date): string => {
  const now = new Date();
  const difference = now.getTime() - dateTime.getTime();
  const minutes = Math.floor(difference / (1000 * 60));
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return 'ahora';
  } else if (hours < 1) {
    return `hace ${minutes}m`;
  } else if (days < 1) {
    return `hace ${hours}h`;
  } else {
    return `${dateTime.getDate()}/${dateTime.getMonth() + 1}`;
  }
};

export default MessageBubble;
