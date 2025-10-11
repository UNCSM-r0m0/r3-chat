import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type Props = { message: ChatMessage };

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`
        w-full flex mb-4 md:mb-6
        ${isUser ? 'justify-end' : 'justify-start'}
      `}
    >
      <div
        className={`
          rounded-2xl px-5 py-4 max-w-[85%] md:max-w-[75%] shadow-lg
          transition-all duration-200 hover:shadow-xl
          ${isUser
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/25'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700'}
        `}
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
    </div>
  );
};

export default MessageBubble;