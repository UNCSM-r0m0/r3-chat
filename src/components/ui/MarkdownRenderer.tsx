import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";

function stripThinkBlocks(s: string) {
  // Oculta <think>…</think> si el modelo lo envía
  return s.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const safe = stripThinkBlocks(content);

  return (
    <div
      className={`
        prose prose-neutral dark:prose-invert
        max-w-none
        whitespace-pre-wrap break-words
        [&>:first-child]:mt-0 [&>:last-child]:mb-0
        prose-code:before:hidden prose-code:after:hidden
      `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          pre: ({ children, ...props }) => (
            <pre
              className="overflow-x-auto rounded-lg p-4 bg-zinc-900 text-zinc-100"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const inline = !match;
            
            return inline ? (
              <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800" {...props}>
                {children}
              </code>
            ) : (
              <code className="block min-w-0" {...props}>
                {children}
              </code>
            );
          },
          a: ({ children, ...props }) => (
            <a className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noreferrer" {...(props as any)}>
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse">{children}</table>
            </div>
          ),
        }}
      >
        {safe}
      </ReactMarkdown>
    </div>
  );
};