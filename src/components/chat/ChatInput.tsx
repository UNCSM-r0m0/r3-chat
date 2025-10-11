import React, { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

import { useChat } from '../../hooks/useChat';

export const ChatInput: React.FC = () => {
  const { sendMessage, isStreaming } = useChat();
  const [value, setValue] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  // autosize simple
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = Math.min(el.scrollHeight, 240) + 'px';
  }, [value]);

  const onSubmit = async () => {
    const msg = value.trim();
    if (!msg || isStreaming) return;
    setValue('');
    await sendMessage(msg);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      className="
        sticky bottom-0 w-full
        bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60
        border-t
      "
    >
      <div className="max-w-3xl mx-auto p-3 sm:p-4 md:p-5">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escribe tu mensaje…"
              rows={1}
              className="
                w-full resize-none outline-none
                rounded-2xl border px-3 py-2 md:px-4 md:py-3
                bg-background
                focus:border-purple-400
              "
            />
            <p className="text-[11px] opacity-60 px-2 pt-1">
              Enter para enviar • Shift+Enter para salto de línea
            </p>
          </div>
          <button
            onClick={onSubmit}
            disabled={!value.trim() || isStreaming}
            className="h-10 w-10 rounded-xl border grid place-items-center hover:bg-muted disabled:opacity-50"
            aria-label="Enviar"
          >
            {isStreaming ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};