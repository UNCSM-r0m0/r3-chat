import React from 'react';

// Escape so HTML code is not interpreted by the browser
const escapeHtml = (code: string): string =>
  code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Minimal, fast, dependency-free highlighter for common languages
const highlightCode = (raw: string, language?: string): string => {
  if (!language || language === 'text') return escapeHtml(raw);

  let highlighted = escapeHtml(raw);

  // HTML / XML: keep escaped, do not colorize to avoid artifacts
  if (language === 'html' || language === 'xml') {
    return highlighted;
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
      .replace(/(\".*?\"|\'.*?\'|`[\s\S]*?`)/g,
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
      .replace(/(\".*?\"|\'.*?\')/g, '<span class="text-green-400">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span class="text-gray-500">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>');
  }

  // C# / CSharp
  if (language === 'csharp' || language === 'cs' || language === 'c#') {
    highlighted = highlighted
      // attributes [Something]
      .replace(/(\[[^\]]+\])/g, '<span class="text-orange-300">$1</span>')
      // keywords
      .replace(/\b(namespace|using|class|struct|record|interface|public|private|protected|internal|static|readonly|sealed|virtual|override|abstract|async|await|var|new|return|if|else|switch|case|default|break|continue|foreach|for|while|do|try|catch|finally|throw|get|set|init|out|ref|in)\b/g,
        '<span class="text-purple-400">$1</span>')
      // types
      .replace(/\b(bool|byte|sbyte|char|decimal|double|float|int|uint|nint|nuint|long|ulong|short|ushort|string|object|void|Task|List|Dictionary|IEnumerable|Span|ReadOnlySpan)\b/g,
        '<span class="text-blue-300">$1</span>')
      // strings (normal and interpolated)
      .replace(/(\$?\"[\s\S]*?\"|\'.*?\')/g, '<span class="text-green-400">$1</span>')
      // comments
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

function withLineNumbers(html: string): string {
  const lines = html.split('\n');
  return lines
    .map((l, i) => {
      const content = l === '' ? '&nbsp;' : l;
      return `<div class=\"flex\"><span class=\"select-none inline-block w-10 text-right pr-3 mr-3 border-r border-gray-700 text-gray-500 tabular-nums\">${i + 1}</span><span class=\"flex-1\">${content}</span></div>`;
    })
    .join('\n');
}

// Carga perezosa de highlight.js + tema atom-one-dark desde CDN
const ensureHighlightJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const w: any = window as any;
    if (w.hljs) return resolve(w.hljs);

    // Inyectar CSS del tema si no existe
    const cssId = 'hljs-atom-one-dark';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      // CDN estable del release empaquetado (evita 404 en /lib/...)
      link.href = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/atom-one-dark.min.css';
      document.head.appendChild(link);
    }

    // Inyectar script principal (incluye lenguajes comunes)
    const s = document.createElement('script');
    // Carga del bundle que incluye lenguajes comunes
    s.src = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js';
    s.async = true;
    s.onload = () => resolve((window as any).hljs);
    s.onerror = () => reject(new Error('highlight.js load error'));
    document.head.appendChild(s);
  });
};

const normalizeLang = (lang?: string): string | undefined => {
  if (!lang) return undefined;
  const l = lang.toLowerCase();
  if (l === 'js') return 'javascript';
  if (l === 'ts') return 'typescript';
  if (l === 'c#' || l === 'cs') return 'csharp';
  if (l === 'sh') return 'bash';
  if (l === 'md') return 'markdown';
  if (l === 'yml') return 'yaml';
  if (l === 'plaintext' || l === 'text') return 'plaintext';
  return l;
};

export const CodeBlock: React.FC<{ language?: string; children: any }> = ({ language = 'text', children }) => {
  const [hlHtml, setHlHtml] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [wrap, setWrap] = React.useState<boolean>(false);
  const codeContent = typeof children === 'string' ? children : children?.props?.children ?? '';

  const langNorm = normalizeLang(language) ?? 'plaintext';
  const lineCount = React.useMemo(() => String(codeContent || '').split('\n').length, [codeContent]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hljs = await ensureHighlightJs();
        const has = langNorm && hljs.getLanguage(langNorm);
        const res = has ? hljs.highlight(codeContent, { language: langNorm }) : hljs.highlightAuto(codeContent);
        if (!cancelled) setHlHtml(res.value as string);
      } catch {
        if (!cancelled) setHlHtml(highlightCode(codeContent, language));
      }
    })();
    return () => { cancelled = true; };
  }, [codeContent, langNorm, language]);

  const renderHtml = (hlHtml ?? highlightCode(codeContent, language));

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  return (
    <div className="my-3">
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-800/50">
          <div className="text-xs font-medium text-gray-300 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded">
            {langNorm}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(c => !c)}
              className="text-xs text-gray-300 hover:text-white px-2 py-1 rounded border border-gray-600"
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
            <button
              onClick={() => setWrap(w => !w)}
              className={`text-xs px-2 py-1 rounded border ${wrap ? 'text-white border-gray-400' : 'text-gray-300 border-gray-600'} hover:text-white`}
              title="Alternar ajuste de línea"
            >
              Wrap
            </button>
            <button
              onClick={copyToClipboard}
              className="text-xs text-gray-300 hover:text-white px-2 py-1 rounded border border-gray-600"
              title="Copiar código"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Body */}
        {collapsed ? (
          <div className="px-4 py-3 text-xs text-gray-400 italic">
            {lineCount} hidden lines
          </div>
        ) : (
          <div className="p-4 overflow-x-auto max-h-96 text-gray-100 font-mono text-sm leading-relaxed">
            <pre className={`${wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'} `}>
              <code className={`hljs block language-${langNorm}`} dangerouslySetInnerHTML={{ __html: renderHtml }} />
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
