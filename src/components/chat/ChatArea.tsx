import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { useChat } from '../../hooks/useChat';

export const ChatArea: React.FC = () => {
  const { currentChat, isStreaming } = useChat();
  const messages = currentChat?.messages || [];
  const scrollerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const [autoStick, setAutoStick] = useState(true); // si estás al final, autoscroll activo
  const hasMessages = (messages?.length ?? 0) > 0;

  // Observa si el sentinel del final es visible → controla autoscroll
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const atBottom = entries[0]?.isIntersecting;
        setAutoStick(!!atBottom);
      },
      { root: scrollerRef.current, threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Autoscroll al recibir contenido nuevo (solo si estamos "pegados" al final)
  useEffect(() => {
    if (!autoStick) return;
    const sc = scrollerRef.current;
    if (!sc) return;
    // usar requestAnimationFrame dos veces ayuda con layout shift
    requestAnimationFrame(() =>
      requestAnimationFrame(() => sc.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' }))
    );
  }, [messages, isStreaming, autoStick]);

  const onJumpBottom = () => {
    const sc = scrollerRef.current;
    if (!sc) return;
    sc.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' });
  };

  const view = useMemo(() => {
    return (
      <>
        {(messages ?? []).map((m, idx) => (
          <div
            key={m.id ?? idx}
            className={`
              w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-3
              ${m.role === 'user' ? 'text-foreground' : 'text-foreground'}
            `}
          >
            <div
              className={`
                rounded-2xl border p-3 md:p-4
                ${m.role === 'user'
                  ? 'bg-white/70 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
                  : 'bg-background border-zinc-200 dark:border-zinc-800'}
              `}
            >
              <MarkdownRenderer content={m.content} />
            </div>
          </div>
        ))}

        {/* El streaming ya está incluido en messages como mensaje temporal */}
      </>
    );
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 min-h-0">
      <div
        ref={scrollerRef}
        className="
          h-full overflow-y-auto overscroll-contain
          px-0 py-2 sm:py-3
          bg-background
        "
      >
        <div className="pb-12">{view}</div>
        {/* Sentinel de final para IntersectionObserver */}
        <div ref={endRef} className="h-1 w-full" />
      </div>

      {/* FAB "bajar al último" cuando NO estás al final */}
      {!autoStick && hasMessages && (
        <button
          onClick={onJumpBottom}
          className="
            fixed md:absolute bottom-24 right-4 md:right-6 z-10
            shadow-lg border rounded-full p-2 bg-background/90 backdrop-blur
            hover:bg-muted transition
          "
          aria-label="Ir al último mensaje"
        >
          <ChevronDown />
        </button>
      )}
    </div>
  );
};