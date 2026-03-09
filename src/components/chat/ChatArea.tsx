import React, { useEffect, useMemo, useRef, useState } from 'react';
import MessageBubble, { type ChatMessage } from '../ui/MessageBubble';

type ChatAreaProps = {
  messages: ChatMessage[];
  isStreaming?: boolean;
  isConversationLoading?: boolean;
  loadingVariant?: 'default' | 'code' | 'math';
  /** padding inferior reservado para el input (px) */
  bottomPadding?: number;
  onResend?: (text: string) => void;
};

const ConversationSkeleton: React.FC<{ variant: 'default' | 'code' | 'math' }> = ({ variant }) => {
  if (variant === 'code') {
    return (
      <div className="space-y-5 animate-pulse" aria-hidden="true">
        <div className="ml-auto h-14 w-[68%] max-w-[680px] rounded-2xl bg-gradient-to-r from-fuchsia-700/45 to-pink-600/45" />
        <div className="overflow-hidden rounded-2xl border border-cyan-700/40 bg-gray-900/70 shadow-[0_0_0_1px_rgba(14,116,144,0.15)]">
          <div className="flex items-center justify-between border-b border-cyan-800/30 px-4 py-2.5">
            <div className="h-4 w-14 rounded bg-cyan-500/20" />
            <div className="h-4 w-24 rounded bg-cyan-500/20" />
          </div>
          <div className="space-y-2 px-4 py-4">
            <div className="h-3 w-11/12 rounded bg-gray-600/50" />
            <div className="h-3 w-3/4 rounded bg-gray-600/40" />
            <div className="h-3 w-10/12 rounded bg-gray-600/45" />
            <div className="h-3 w-2/3 rounded bg-gray-600/35" />
            <div className="h-3 w-4/5 rounded bg-gray-600/40" />
            <div className="h-3 w-1/2 rounded bg-gray-600/35" />
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-gray-700/60 bg-gray-900/55 p-4">
          <div className="h-3 w-2/5 rounded bg-gray-600/60" />
          <div className="h-3 w-full rounded bg-gray-700/70" />
          <div className="h-3 w-11/12 rounded bg-gray-700/60" />
          <div className="h-3 w-4/5 rounded bg-gray-700/50" />
        </div>
      </div>
    );
  }

  if (variant === 'math') {
    return (
      <div className="space-y-5 animate-pulse" aria-hidden="true">
        <div className="h-14 w-[62%] rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-700/25 via-indigo-700/20 to-cyan-700/20" />
        <div className="rounded-2xl border border-indigo-500/30 bg-gray-900/70 p-4 shadow-[0_0_0_1px_rgba(99,102,241,0.12)]">
          <div className="mb-3 h-4 w-24 rounded bg-indigo-500/20" />
          <div className="space-y-2">
            <div className="h-3 w-9/12 rounded bg-indigo-400/30" />
            <div className="h-3 w-7/12 rounded bg-cyan-400/25" />
            <div className="h-3 w-10/12 rounded bg-indigo-400/25" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-indigo-500/20 bg-gray-900/60 p-3">
            <div className="h-3 w-2/3 rounded bg-indigo-500/20" />
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-gray-900/60 p-3">
            <div className="h-3 w-3/4 rounded bg-cyan-500/20" />
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-gray-700/60 bg-gray-900/55 p-4">
          <div className="h-3 w-full rounded bg-gray-700/60" />
          <div className="h-3 w-11/12 rounded bg-gray-700/55" />
          <div className="h-3 w-3/4 rounded bg-gray-700/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-pulse" aria-hidden="true">
      <div className="ml-auto h-14 w-[68%] max-w-[680px] rounded-2xl bg-gradient-to-r from-fuchsia-700/45 to-pink-600/45" />
      <div className="h-40 w-full rounded-2xl border border-gray-700/70 bg-gray-900/65" />
      <div className="space-y-3 rounded-2xl border border-gray-700/60 bg-gray-900/50 p-4">
        <div className="h-3 w-2/5 rounded bg-gray-600/60" />
        <div className="h-3 w-full rounded bg-gray-700/70" />
        <div className="h-3 w-11/12 rounded bg-gray-700/60" />
        <div className="h-3 w-4/5 rounded bg-gray-700/50" />
      </div>
      <div className="h-24 w-[86%] rounded-2xl border border-gray-700/70 bg-gray-900/55" />
    </div>
  );
};

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isStreaming = false, isConversationLoading = false, loadingVariant = 'default', bottomPadding = 96, onResend }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const prevLoadingRef = useRef(isConversationLoading);
  const [userIsNearBottom, setUserIsNearBottom] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(!isConversationLoading);
  const [isStaggering, setIsStaggering] = useState(false);
  // Diseño centrado tipo ChatGPT: contenedor estrecho por defecto (sin flag no usado)

  // Centrado + ancho máximo "tipo ChatGPT"
  const padBottom = useMemo(() => Math.max(24, bottomPadding + 24), [bottomPadding]);

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
    if (isConversationLoading) return;
    if (userIsNearBottom) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isStreaming, userIsNearBottom, isConversationLoading]);

  // Fuerza scroll al enviar un mensaje del usuario, incluso si está lejos del fondo
  useEffect(() => {
    if (isConversationLoading) return;
    if (!messages || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'user') {
      const container = scrollerRef.current;
      if (!container) return;
      const el = container.querySelector(`[data-msg-id="${last.id}"]`) as HTMLElement | null;
      if (!el) {
        // fallback: bottom
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        return;
      }
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      const delta = eRect.top - cRect.top; // distancia desde top del contenedor
      const top = container.scrollTop + delta - 12; // dejar margen arriba
      container.scrollTo({ top, behavior: 'smooth' });
      // Opcional: enfocar para accesibilidad
      el.setAttribute('tabindex', '-1');
      try { el.focus({ preventScroll: true } as FocusOptions); } catch { void 0; }
    }
  }, [messages, isConversationLoading]);

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isConversationLoading;

    if (isConversationLoading) {
      setIsContentVisible(false);
      setIsStaggering(false);
      return;
    }

    if (wasLoading) {
      setIsStaggering(true);
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsContentVisible(true);
    });

    const timeoutId = window.setTimeout(() => {
      setIsStaggering(false);
    }, 700);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [isConversationLoading, messages.length]);

  // Contenedor centrado pero responsivo: se ensancha en pantallas grandes
  const containerMaxWClass = 'max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl';

  return (
    <div
      ref={scrollerRef}
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-gray-800 dark:bg-gray-800 scrollbar-gutter-stable"
      style={{ scrollBehavior: 'smooth', height: '100%' }}
      aria-label="Chat messages"
    >
      <div className={`mx-auto w-full ${containerMaxWClass} px-4 md:px-8 lg:px-12 pt-8 pb-4`} style={{ paddingBottom: padBottom }}>
        {/* Encabezado de espacio (opcional) */}
        {isConversationLoading ? (
          <div className="transition-all duration-300 ease-out opacity-100 translate-y-0">
            <ConversationSkeleton variant={loadingVariant} />
          </div>
        ) : messages.length === 0 ? (
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
            {messages.map((m, idx) => {
              const isErrorAssistant = m.role === 'assistant' && /Error al conectar|Servidor no responde|timeout|interrumpido/i.test(m.content || '');
              let resendHandler: (() => void) | undefined;
              if (isErrorAssistant && onResend) {
                // Buscar el último mensaje de usuario anterior
                for (let j = idx - 1; j >= 0; j--) {
                  const prev = messages[j];
                  if (prev.role === 'user' && prev.content) {
                    const text = prev.content;
                    resendHandler = () => onResend(text);
                    break;
                  }
                }
              }

              const shouldStagger = isStaggering && idx < 10;
              const delayMs = shouldStagger ? idx * 45 : 0;

              return (
                <div
                  key={m.id}
                  className={`transition-all duration-300 ease-out ${isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
                  style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
                >
                  <MessageBubble message={m} onResend={resendHandler} />
                </div>
              );
            })}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatArea;
