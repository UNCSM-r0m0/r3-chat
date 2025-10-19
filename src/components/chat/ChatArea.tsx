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
  // Diseño centrado tipo ChatGPT: contenedor estrecho por defecto
  const [narrow] = useState(true);

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

  // Contenedor centrado pero responsivo: se ensancha en pantallas grandes
  const containerMaxWClass = 'max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl';

  return (
    <div
      ref={scrollerRef}
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-gray-800 dark:bg-gray-800"
      style={{ 
        scrollBehavior: 'smooth',
        height: '100%',
        maxHeight: '100vh'
      }}
      aria-label="Chat messages"
    >
      <div className={`mx-auto w-full ${containerMaxWClass} px-4 md:px-8 lg:px-12 pt-8 pb-4`} style={{ paddingBottom: padBottom }}>
        {/* Encabezado de espacio (opcional) */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              ¡Bienvenido a R3.chat!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg">
              Comienza una nueva conversación escribiendo tu mensaje en el campo de abajo.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatArea;
