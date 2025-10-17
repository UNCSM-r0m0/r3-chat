import React from 'react';

// Escape so HTML code is not interpreted by the browser
const escapeHtml = (code: string): string =>
  code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Minimal, fast, dependency-free highlighter for common languages
const highlightCode = (raw: string, language?: string): string => {
  if (!language || language === 'text') return escapeHtml(raw);

  let highlighted = escapeHtml(raw);

  // HTML/XML
  if (language === 'html' || language === 'xml') {
    highlighted = highlighted
      .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)([^&]*?)(&gt;)/g,
        '<span class="text-blue-400">$1</span><span class="text-purple-400">$2</span><span class="text-yellow-400">$3</span><span class="text-blue-400">$4</span>')
      .replace(/([a-zA-Z][a-zA-Z0-9-]*)(=)(".*?")/g,
        '<span class="text-cyan-400">$1</span><span class="text-gray-400">$2</span><span class="text-green-400">$3</span>');
  }

  // CSS
  if (language === 'css') {
    highlighted = highlighted
      .replace(/([a-zA-Z][a-zA-Z0-9-]*)(\s*{)/g,
        '<span class="text-purple-400">$1</span><span class="text-gray-400">$2</span>')
      .replace(/([a-zA-Z][a-zA-Z0-9-]*)(\s*:)/g,
        '<span class="text-cyan-400">$1</span><span class="text-gray-400">$2</span>')
      .replace(/(:\s*)([^;]+)(;)/g,
        '<span class="text-gray-400">$1</span><span class="text-green-400">$2</span><span class="text-gray-400">$3</span>');
  }

  // JavaScript / TypeScript
  if (language === 'javascript' || language === 'js' || language === 'ts' || language === 'typescript') {
    highlighted = highlighted
      .replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export|extends|implements|new|throw|try|catch|finally|switch|case|break|continue)\b/g,
        '<span class="text-purple-400">$1</span>')
      .replace(/(".*?"|'.*?'|`[\s\S]*?`)/g,
        '<span class="text-green-400">$1</span>')
      .replace(/(\/\/.*$)/gm,
        '<span class="text-gray-500">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g,
        '<span class="text-gray-500">$1</span>');
  }

  // C / C++ basic
  if (language === 'cpp' || language === 'c++' || language === 'c') {
    highlighted = highlighted
      .replace(/(^|\n)\s*#(include|define|ifdef|ifndef|endif|pragma)\b/g,
        '$1<span class="text-orange-400">#$2</span>')
      .replace(/&lt;([^&>]+)&gt;/g, '<span class="text-blue-300">&lt;$1&gt;</span>')
      .replace(/\b(int|float|double|char|void|bool|string|auto|constexpr|const|volatile|unsigned|signed|long|short|namespace|using|std|class|struct|public|private|protected|template|typename|switch|case|break|continue|return|for|while|do|if|else|new|delete|nullptr|this|virtual|override)\b/g,
        '<span class="text-purple-400">$1</span>')
      .replace(/\b(std::[a-zA-Z_][a-zA-Z0-9_]*)\b/g, '<span class="text-cyan-400">$1</span>')
      .replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span class="text-gray-500">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>');
  }

  // Shell
  if (language === 'bash' || language === 'sh' || language === 'shell') {
    highlighted = highlighted
      .replace(/(^|\n)\s*\$\s+(.*)/g, '$1<span class="text-gray-400">$ </span><span class="text-gray-200">$2</span>')
      .replace(/(#.*$)/gm, '<span class="text-gray-500">$1</span>');
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
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  return (
    <div className="my-4">
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 font-mono">{language}</span>
            <button
              onClick={copyToClipboard}
              className="text-gray-400 hover:text-gray-200 transition-colors text-xs"
              title="Copiar código"
            >
              ⧉
            </button>
          </div>
        </div>

        <div className="p-6 overflow-x-auto max-h-96 bg-gray-900 text-gray-100 font-mono text-sm leading-relaxed">
          <pre className="whitespace-pre-wrap break-words">
            <code className="block" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </pre>
        </div>
      </div>
    </div>
  );
};

