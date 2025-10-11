import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import { cn } from '../../utils/cn';

interface MathMarkdownProps {
  content: string;
  className?: string;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({ 
  content, 
  className 
}) => {
  // Limpiar contenido: remover tags <think> y espacios extra
  const cleanContent = content
    .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remover tags <think> (case insensitive)
    .replace(/<\/?think>/gi, '') // Remover tags sueltos
    .replace(/\n{3,}/g, '\n\n') // Máximo 2 saltos de línea consecutivos
    .trim();

  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeMathjax]}
        components={{
          // Personalizar el renderizado de código
          code({ node, className, children, ...props }: any) {
            const inline = !className?.includes('language-');
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language) {
              return (
                <div className="my-4">
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {language}
                      </span>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code className={`language-${language}`} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                </div>
              );
            }
            
            return (
              <code 
                className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono" 
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // Personalizar párrafos para mejor espaciado
          p({ children }) {
            return <p className="mb-4 leading-relaxed">{children}</p>;
          },
          
          // Personalizar listas
          ul({ children }) {
            return <ul className="mb-4 ml-6 space-y-2 list-disc">{children}</ul>;
          },
          
          ol({ children }) {
            return <ol className="mb-4 ml-6 space-y-2 list-decimal">{children}</ol>;
          },
          
          // Personalizar encabezados
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 text-white">{children}</h1>;
          },
          
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 text-white">{children}</h2>;
          },
          
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 text-white">{children}</h3>;
          },
          
          // Personalizar enlaces
          a({ href, children }) {
            return (
              <a 
                href={href} 
                className="text-purple-400 hover:text-purple-300 underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          
          // Personalizar tablas
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-600">
                  {children}
                </table>
              </div>
            );
          },
          
          th({ children }) {
            return (
              <th className="border border-gray-600 px-4 py-2 bg-gray-800 text-left font-semibold text-white">
                {children}
              </th>
            );
          },
          
          td({ children }) {
            return (
              <td className="border border-gray-600 px-4 py-2 text-gray-200">
                {children}
              </td>
            );
          },
          
          // Personalizar bloques de cita
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-gray-800/50 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          
          // Personalizar elementos matemáticos
          div({ className, children }) {
            if (className?.includes('math')) {
              return (
                <div className="my-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  {children}
                </div>
              );
            }
            return <div className={className}>{children}</div>;
          }
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};
