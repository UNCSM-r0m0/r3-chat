import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

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
  const isErrorAssistant = !isUser && /Error al conectar|Servidor no responde|timeout/i.test(message.content || '');

  return (
    <div className={`w-full flex mb-4 md:mb-6`} data-msg-id={message.id}>
      <div className={`flex items-start gap-3 w-full max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto ${isUser ? 'ml-auto' : 'mr-auto'}`}>
        {/* Avatar del asistente */}
        {!isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Acción de reintento debajo del mensaje de error */}
          {!isUser && isErrorAssistant && onResend && (
            <div className="mt-2 text-left">
              <button
                onClick={onResend}
                className="text-xs px-2 py-1 rounded border border-gray-500 text-gray-200 hover:bg-gray-600 transition-colors"
              >
                Reintentar envío
              </button>
            </div>
          )}
        )}

        {/* Contenido del mensaje */}
        <div className="flex-1 min-w-0">
          <div
            className={`
              px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl
              ${isUser
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/25'
                : 'bg-gray-700 text-gray-100 shadow-gray-900/50 border border-gray-600'
              }
            `}
            style={{
              borderRadius: isUser 
                ? '20px 20px 4px 20px' 
                : '20px 20px 20px 4px'
            }}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words leading-relaxed text-sm font-medium">
                {message.content}
              </div>
            ) : (
              <div className="text-sm leading-relaxed">
                <MarkdownRenderer content={message.content} />
              </div>
            )}
          </div>

          {/* Timestamp */}
          {message.timestamp && (
            <div className={`mt-1 text-xs text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>
              {formatTime(message.timestamp)}
            </div>
          )}
        </div>

        {/* Avatar del usuario */}
        {isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Función para formatear tiempo (similar a la móvil)
const formatTime = (dateTime: Date): string => {
  const now = new Date();
  const difference = now.getTime() - dateTime.getTime();
  const minutes = Math.floor(difference / (1000 * 60));
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return 'Ahora';
  } else if (hours < 1) {
    return `${minutes}m`;
  } else if (days < 1) {
    return `${hours}h`;
  } else {
    return `${dateTime.getDate()}/${dateTime.getMonth() + 1}`;
  }
};

export default MessageBubble;
