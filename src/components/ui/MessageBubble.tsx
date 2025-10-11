import { MarkdownRenderer } from "./MarkdownRenderer";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
      <div
        className={[
          // contenedor burbuja
          "rounded-2xl px-4 py-3 shadow-sm",
          // límite de ancho para que no se haga una línea infinita
          "max-w-[min(80ch,100%)]",
          // estilos por rol
          isUser
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        ].join(" ")}
      >
        {/* Markdown bien formateado */}
        <MarkdownRenderer content={message.content} />
      </div>
    </div>
  );
}