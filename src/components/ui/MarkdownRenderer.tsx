import React, { useState } from 'react';

/** Detección de diferentes tipos de bloques: think, code, boxed, etc. */
function splitMarkdownBlocks(src: string) {
  const parts: Array<{ 
    type: 'think' | 'code' | 'boxed' | 'text'; 
    lang?: string; 
    content: string;
    isCollapsible?: boolean;
  }> = [];
  
  let lastIndex = 0;
  
  // Regex para diferentes tipos de bloques
  const patterns = [
    { regex: /<think>([\s\S]*?)<\/think>/gi, type: 'think' as const },
    { regex: /```(\w+)?\n([\s\S]*?)```/g, type: 'code' as const },
    { regex: /\\boxed\{([^}]+)\}/g, type: 'boxed' as const },
  ];
  
  const matches: Array<{ index: number; type: string; content: string; lang?: string }> = [];
  
  // Encontrar todos los matches
  patterns.forEach(({ regex, type }) => {
    let m: RegExpExecArray | null;
    while ((m = regex.exec(src))) {
      if (type === 'code') {
        matches.push({
          index: m.index,
          type,
          content: m[2],
          lang: m[1]
        });
      } else if (type === 'boxed') {
        matches.push({
          index: m.index,
          type,
          content: m[1]
        });
      } else {
        matches.push({
          index: m.index,
          type,
          content: m[1]
        });
      }
    }
  });
  
  // Ordenar por posición
  matches.sort((a, b) => a.index - b.index);
  
  // Construir partes
  matches.forEach(match => {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: src.slice(lastIndex, match.index) });
    }
    
    parts.push({
      type: match.type as any,
      content: match.content,
      lang: match.lang,
      isCollapsible: match.type === 'think'
    });
    
    lastIndex = match.index + (match.type === 'code' ? 
      `\`\`\`${match.lang || ''}\n${match.content}\`\`\``.length :
      match.type === 'boxed' ? 
      `\\boxed{${match.content}}`.length :
      `<think>${match.content}</think>`.length
    );
  });
  
  if (lastIndex < src.length) {
    parts.push({ type: 'text', content: src.slice(lastIndex) });
  }
  
  return parts;
}

function renderTextMarkdown(s: string) {
  // Limpiar y formatear texto
  let text = s
    .replace(/\r/g, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, ' ') // Normalizar espacios
    .replace(/\\\[/g, '[') // Convertir \[ a [
    .replace(/\\\]/g, ']') // Convertir \] a ]
    .replace(/\\\(/g, '(') // Convertir \( a (
    .replace(/\\\)/g, ')') // Convertir \) a )
    .replace(/\\boxed\{([^}]+)\}/g, '**$1**'); // Convertir \boxed{} a negritas

  // Muy básico: convierte saltos en <p> y listas simples
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let buf: string[] = [];
  const flushP = () => {
    if (buf.length) {
      const html = buf.join('\n')
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a class="link" href="$2" target="_blank" rel="noreferrer">$1</a>');
      out.push(<p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />);
      buf = [];
    }
  };

  let inList = false;
  for (const ln of lines) {
    if (/^\s*[-*]\s+/.test(ln)) {
      if (!inList) {
        flushP();
        inList = true;
        out.push(<ul className="list-disc pl-6 mb-2" key={`ul-${out.length}`} />);
      }
      const last = out[out.length - 1] as React.ReactElement<any>;
      const item = ln.replace(/^\s*[-*]\s+/, '');
      const children = (last.props.children as any[]) || [];
      children.push(<li className="mb-1" key={`li-${children.length}`}>{item}</li>);
    } else if (/^\s*#{1,6}\s+/.test(ln)) {
      flushP();
      const level = (ln.match(/^\s*(#{1,6})/)![1].length);
      const txt = ln.replace(/^\s*#{1,6}\s+/, '');
      const Tag = `h${Math.min(level, 3)}` as 'h1' | 'h2' | 'h3';
      out.push(React.createElement(Tag, { className: "font-semibold mt-3 mb-1" }, txt));
    } else if (ln.trim() === '') {
      flushP();
    } else {
      buf.push(ln);
    }
  }
  flushP();
  return out;
}

// Componente para bloques de pensamiento colapsables
const ThinkBlock: React.FC<{ content: string }> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="my-4 border border-gray-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-left text-sm text-gray-300 flex items-center justify-between transition-colors"
      >
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          💭 Pensamiento del modelo
        </span>
        <span className="text-xs opacity-70">
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </span>
      </button>
      {isExpanded && (
        <div className="px-4 py-3 bg-gray-900 text-gray-300 text-sm leading-relaxed">
          {content.trim()}
        </div>
      )}
    </div>
  );
};

// Componente para bloques de código
const CodeBlock: React.FC<{ content: string; language?: string }> = ({ content, language }) => {
  return (
    <div className="my-4 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      {language && (
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-xs text-gray-400 font-mono">
          {language}
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-200 font-mono">{content}</code>
      </pre>
    </div>
  );
};

// Componente para respuestas en caja
const BoxedBlock: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="my-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-300">
          {content}
        </div>
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const blocks = splitMarkdownBlocks(content);
  
  return (
    <div className="markdown-body text-sm md:text-base leading-relaxed">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'think':
            return <ThinkBlock key={i} content={b.content} />;
          case 'code':
            return <CodeBlock key={i} content={b.content} language={b.lang} />;
          case 'boxed':
            return <BoxedBlock key={i} content={b.content} />;
          default:
            return (
              <div key={i} className="space-y-2">
                {renderTextMarkdown(b.content)}
              </div>
            );
        }
      })}
    </div>
  );
};