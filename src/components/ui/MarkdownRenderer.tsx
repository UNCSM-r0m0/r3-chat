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
    <article className="prose dark:prose-invert max-w-none break-words whitespace-pre-wrap leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          pre: ({ children, ...props }) => (
            <pre
              className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3"
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
              <code className="block" {...props}>
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
    </article>
  );
};