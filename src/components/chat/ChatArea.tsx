import React, { useEffect, useMemo, useRef, useState } from 'react';
import MessageBubble, { type ChatMessage } from '../ui/MessageBubble';

type ChatAreaProps = {
  messages: ChatMessage[];
  isStreaming?: boolean;
  /** padding inferior reservado para el input (px) */
  bottomPadding?: number;
};

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isStreaming = false, bottomPadding = 96 }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [userIsNearBottom, setUserIsNearBottom] = useState(true);

  // Centrado + ancho máximo "tipo ChatGPT"
  const padBottom = useMemo(() => Math.max(16, bottomPadding + 16), [bottomPadding]);

  // Detecta si el usuario está lo suficientemente abajo como para auto–desplazar
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 120;
      const distanceToBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
      setUserIsNearBottom(distanceToBottom < threshold);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Autoscroll solo si el usuario está abajo (o si es el primer render)
  useEffect(() => {
    if (userIsNearBottom) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isStreaming, userIsNearBottom]);

  return (
    <div
      ref={scrollerRef}
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-background"
      style={{ scrollBehavior: 'smooth' }}
      aria-label="Chat messages"
    >
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6 pt-6 pb-4" style={{ paddingBottom: padBottom }}>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatArea;