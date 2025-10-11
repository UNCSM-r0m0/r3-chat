import { useEffect, useRef } from "react";
import MessageBubble, { type ChatMessage } from "../ui/MessageBubble";

interface ChatAreaProps {
  messages: ChatMessage[];
  /** padding-bottom dinámico (altura del input) */
  bottomPadding?: number;
  /** si quieres forzar autoscroll mientras hay stream */
  isStreaming?: boolean;
}

/**
 * Área scrollable del chat (tipo ChatGPT):
 * - Autoscroll al final cuando llegan mensajes o mientras hay streaming
 * - Respeta espacios/saltos de línea y hace wrap correcto
 * - Aplica padding-bottom para que el input no tape el contenido
 */
export default function ChatArea({
  messages,
  bottomPadding = 96,
  isStreaming = false,
}: ChatAreaProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // scroll suave al final cuando cambian los mensajes o hay stream
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isStreaming]);

  return (
    <div
      className={`
        flex-1 overflow-y-auto overscroll-contain
        px-4 sm:px-6 py-4
      `}
      // Reservamos espacio inferior igual a la altura del input
      style={{ paddingBottom: bottomPadding }}
    >
      {/* opcional: separador superior */}
      <div className="h-2" />

      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}

      {/* sentinel para autoscroll */}
      <div ref={endRef} className="h-2" />
    </div>
  );
}