import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

export type ChatRole = "user" | "assistant" | "system";

export interface MessageBubbleProps {
  role: ChatRole;
  content: string;
  streaming?: boolean;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  streaming,
  className = "",
}) => {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div
      className={[
        "max-w-3xl mx-auto rounded-2xl px-4 py-3 shadow-sm animate-fade-in",
        isUser
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white ml-auto"
          : isSystem
          ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 mr-auto"
          : "bg-muted text-foreground mr-auto",
        className,
      ].join(" ")}
    >
      <MarkdownRenderer content={content} />
      {streaming && (
        <span className="ml-1 inline-block h-4 w-2 align-baseline animate-pulse bg-current/60 rounded-sm" />
      )}
    </div>
  );
};
