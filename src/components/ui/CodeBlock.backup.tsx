import React from 'react';

// Función simple para syntax highlighting básico
const highlightCode = (code: string, language?: string): string => {
  if (!language || language === 'text') return code;
  
  let highlighted = code;
  
  // HTML highlighting
  if (language === 'html' || language === 'xml') {
    highlighted = highlighted
      .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)([^&]*?)(&gt;)/g, 
        '<span class="text-blue-400">$1</span><span class="text-purple-400">$2</span><span class="text-yellow-400">$3</span><span class="text-blue-400">$4</span>')
      .replace(/([a-zA-Z][a-zA-Z0-9]*)(=)(".*?")/g, 
        '<span class="text-cyan-400">$1</span><span class="text-gray-400">$2</span><span class="text-green-400">$3</span>');
  }
  
  // CSS highlighting
  if (language === 'css') {
    highlighted = highlighted
      .replace(/([a-zA-Z][a-zA-Z0-9-]*)(\s*{)/g, 
        '<span class="text-purple-400">$1</span><span class="text-gray-400">$2</span>')
      .replace(/([a-zA-Z][a-zA-Z0-9-]*)(\s*:)/g, 
        '<span class="text-cyan-400">$1</span><span class="text-gray-400">$2</span>')
      .replace(/(:\s*)([^;]+)(;)/g, 
        '<span class="text-gray-400">$1</span><span class="text-green-400">$2</span><span class="text-gray-400">$3</span>');
  }
  
  // JavaScript highlighting
  if (language === 'javascript' || language === 'js') {
    highlighted = highlighted
      .replace(/(function|const|let|var|if|else|for|while|return|class|import|export)\b/g, 
        '<span class="text-purple-400">$1</span>')
      .replace(/(".*?"|'.*?')/g, 
        '<span class="text-green-400">$1</span>')
      .replace(/(\/\/.*$)/gm, 
        '<span class="text-gray-500">$1</span>');
  }
  
  return highlighted;
};

export const CodeBlock: React.FC<{ language?: string; children: any }> = ({
  language = 'text',
  children,
}) => {
  const codeContent = typeof children === 'string' ? children : children?.props?.children ?? '';
  const highlightedCode = highlightCode(codeContent, language);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      // Opcional: mostrar un toast de confirmación
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  return (
    <div className="my-4">
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
        {/* Header estilo Mac */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {/* Botones de ventana estilo Mac */}
            <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors cursor-pointer"></div>
          </div>
          
          {/* Información del archivo */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 font-mono">
              {language}
            </span>
            <button 
              onClick={copyToClipboard}
              className="text-gray-400 hover:text-gray-200 transition-colors text-xs"
              title="Copiar código"
            >
              📋
            </button>
          </div>
        </div>
        
        {/* Contenido del código */}
        <div className="p-6 overflow-x-auto max-h-96 bg-gray-900 text-gray-100 font-mono text-sm leading-relaxed">
          <pre className="whitespace-pre-wrap break-words">
            <code 
              className="block"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
};
