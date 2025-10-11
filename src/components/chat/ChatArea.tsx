import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { MessageBubble } from "../ui/MessageBubble";

export interface ChatAreaMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;
}

interface ChatAreaProps {
  messages: ChatAreaMessage[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const [showToBottom, setShowToBottom] = useState(false);

  const scrollToBottom = (smooth = true) =>
    endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });

  // botón "ir al final"
  useEffect(() => {
    const el = document.getElementById("chat-scroll-area");
    if (!el) return;
    const onScroll = () => {
      const dist = el.scrollHeight - el.clientHeight - el.scrollTop;
      setShowToBottom(dist > 160);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // autoscroll solo si estás cerca del final
  useEffect(() => {
    const el = document.getElementById("chat-scroll-area");
    if (!el) return;
    const dist = el.scrollHeight - el.clientHeight - el.scrollTop;
    if (dist < 200) scrollToBottom(false);
  }, [messages.length]);

  const bubbles = useMemo(
    () =>
      messages.map((m) => (
        <MessageBubble
          key={m.id}
          role={m.role}
          content={m.content}
          streaming={m.streaming}
        />
      )),
    [messages]
  );

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">{bubbles}</div>
      <div ref={endRef} className="h-0" />

      {showToBottom && (
        <button
          onClick={() => scrollToBottom()}
          className="fixed right-4 sm:right-8 bottom-24 sm:bottom-28 z-20 inline-flex items-center gap-2 rounded-full border border-border bg-background/90 backdrop-blur px-3 py-2 text-sm shadow-md hover:bg-muted transition"
          aria-label="Bajar al último"
        >
          <ChevronDown className="h-4 w-4" />
          <span className="hidden sm:inline">Ir al final</span>
        </button>
      )}
    </div>
  );
};