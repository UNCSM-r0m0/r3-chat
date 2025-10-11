import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeMathjax from 'rehype-mathjax';

import { CodeBlock } from './CodeBlock';

const stripThink = (s: string) =>
  s.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, '');

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const safe = useMemo(() => stripThink(content ?? ''), [content]);
  
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none break-words text-gray-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeMathjax]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const inline = !match; // Si no hay match, es inline
            
            if (!inline) {
              return (
                <CodeBlock language={match?.[1] ?? 'text'} {...props}>
                  {String(children)}
                </CodeBlock>
              );
            }
            return <code className="break-words bg-gray-800 text-gray-200 px-1 py-0.5 rounded text-sm">{children}</code>;
          },
          pre({ children }) {
            return <pre className="overflow-x-auto rounded-xl bg-gray-900 p-4">{children}</pre>;
          },
          
          // Personalizar el renderizado de párrafos
          p({ children }) {
            return (
              <p className="mb-3 text-gray-100 leading-relaxed">
                {children}
              </p>
            );
          },
          
          // Personalizar el renderizado de encabezados
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">
                {children}
              </h1>
            );
          },
          
          h2({ children }) {
            return (
              <h2 className="text-xl font-bold text-white mb-3 mt-5 first:mt-0">
                {children}
              </h2>
            );
          },
          
          h3({ children }) {
            return (
              <h3 className="text-lg font-semibold text-white mb-2 mt-4 first:mt-0">
                {children}
              </h3>
            );
          },
          
          // Personalizar el renderizado de listas
          ul({ children }) {
            return (
              <ul className="mb-3 ml-4 list-disc text-gray-100">
                {children}
              </ul>
            );
          },
          
          ol({ children }) {
            return (
              <ol className="mb-3 ml-4 list-decimal text-gray-100">
                {children}
              </ol>
            );
          },
          
          li({ children }) {
            return (
              <li className="mb-1 text-gray-100">
                {children}
              </li>
            );
          },
          
          // Personalizar el renderizado de enlaces
          a({ href, children }) {
            return (
              <a 
                href={href}
                className="text-purple-400 hover:text-purple-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          
          // Personalizar el renderizado de citas
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-purple-500 pl-4 my-4 italic text-gray-300">
                {children}
              </blockquote>
            );
          },
          
          // Personalizar el renderizado de tablas
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-700">
                  {children}
                </table>
              </div>
            );
          },
          
          th({ children }) {
            return (
              <th className="border border-gray-700 px-3 py-2 bg-gray-800 text-white font-semibold text-left">
                {children}
              </th>
            );
          },
          
          td({ children }) {
            return (
              <td className="border border-gray-700 px-3 py-2 text-gray-200">
                {children}
              </td>
            );
          },
          
          // Personalizar el renderizado de imágenes
          img({ src, alt }) {
            return (
              <img 
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-lg my-4"
              />
            );
          },
          
          // Personalizar el renderizado de texto fuerte
          strong({ children }) {
            return (
              <strong className="font-semibold text-purple-400">
                {children}
              </strong>
            );
          },
          
          // Personalizar el renderizado de texto enfatizado
          em({ children }) {
            return (
              <em className="italic text-gray-200">
                {children}
              </em>
            );
          },
        }}
      >
        {safe}
      </ReactMarkdown>
    </div>
  );
};
