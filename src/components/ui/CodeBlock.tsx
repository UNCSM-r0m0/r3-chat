import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CodeBlockProps {
  language: string;
  children: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language, 
  children, 
  className 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  // Detectar el lenguaje si no se especifica
  const detectedLanguage = language || 'text';

  return (
    <div className={cn('relative group', className)}>
      {/* Header con botón de copiar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 font-mono">
            {detectedLanguage}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
            title="Copiar código"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Código con resaltado de sintaxis */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={detectedLanguage}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#1a1a1a',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            borderRadius: '0 0 0.5rem 0.5rem',
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
