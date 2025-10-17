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
  const [narrow, setNarrow] = useState(true); // conversacion estrecha por defecto

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

  const containerMaxWClass = narrow ? 'max-w-3xl' : 'max-w-6xl';

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
      <div className={`mx-auto w-full ${containerMaxWClass} px-6 md:px-12 pt-8 pb-4`} style={{ paddingBottom: padBottom }}>
        {/* Toggle ancho/narrow */}
        <div className="sticky top-0 z-10 -mt-2 mb-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setNarrow(v => !v)}
              className="text-xs px-3 py-1 rounded border border-gray-600 bg-gray-900 text-gray-200 hover:bg-gray-800 transition-colors"
              title={narrow ? 'Cambiar a anchura completa' : 'Cambiar a conversacion estrecha'}
              aria-pressed={!narrow}
            >
              {narrow ? 'Anchura completa' : 'Conversacion estrecha'}
            </button>
          </div>
        </div>
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
