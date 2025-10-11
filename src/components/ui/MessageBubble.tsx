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
        w-full flex mb-3 md:mb-4
        ${isUser ? 'justify-end' : 'justify-start'}
      `}
    >
      <div
        className={`
          rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[80%] shadow-sm
          ${isUser
            ? 'bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white'
            : 'bg-muted/50 dark:bg-zinc-800/70 text-foreground'}
        `}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;