import React from 'react';

export const CodeBlock: React.FC<{ language?: string; children: any }> = ({
  language = 'text',
  children,
}) => {
  const codeContent = typeof children === 'string' ? children : children?.props?.children ?? '';
  
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
        <pre className="p-4 overflow-x-auto max-h-96 bg-gray-800">
          <code className="text-sm text-gray-200 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {codeContent}
          </code>
        </pre>
      </div>
    </div>
  );
};