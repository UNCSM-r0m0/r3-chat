import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className 
}) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Personalizar el renderizado de bloques de código
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const inline = !match;
            
            // Si es un bloque de código (no inline)
            if (!inline && language) {
              return (
                <CodeBlock 
                  language={language}
                  className="my-4"
                >
                  {String(children).replace(/\n$/, '')}
                </CodeBlock>
              );
            }
            
            // Si es código inline
            return (
              <code 
                className="px-1 py-0.5 bg-gray-800 text-gray-200 rounded text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // Personalizar el renderizado de párrafos
          p({ children }) {
            return (
              <p className="mb-3 text-gray-200 leading-relaxed">
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
              <ul className="mb-3 ml-4 list-disc text-gray-200">
                {children}
              </ul>
            );
          },
          
          ol({ children }) {
            return (
              <ol className="mb-3 ml-4 list-decimal text-gray-200">
                {children}
              </ol>
            );
          },
          
          li({ children }) {
            return (
              <li className="mb-1 text-gray-200">
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
              <em className="italic text-gray-300">
                {children}
              </em>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
