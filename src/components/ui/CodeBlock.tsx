import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('yaml', yaml);

type CodeBlockProps = {
  language?: string;
  children: React.ReactNode;
};

const normalizeLanguage = (language?: string): string => {
  if (!language) return 'plaintext';

  const lang = language.toLowerCase();
  if (lang === 'js') return 'javascript';
  if (lang === 'ts') return 'typescript';
  if (lang === 'sh') return 'bash';
  if (lang === 'yml') return 'yaml';
  if (lang === 'md') return 'markdown';
  if (lang === 'cs' || lang === 'c#') return 'csharp';
  if (lang === 'text') return 'plaintext';
  return lang;
};

const extractCode = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractCode).join('');
  return '';
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [wrap, setWrap] = React.useState(false);
  const code = extractCode(children);
  const languageLabel = normalizeLanguage(language);
  const lineCount = React.useMemo(() => code.split('\n').length, [code]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      void 0;
    }
  };

  return (
    <div className="my-3 rounded-lg border border-gray-700 bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-gray-700 bg-gray-800/70 px-3 py-2">
        <span className="rounded border border-gray-600 bg-gray-800 px-2 py-0.5 text-xs text-gray-200">
          {languageLabel}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-300 hover:text-white"
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
          <button
            onClick={() => setWrap((prev) => !prev)}
            className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-300 hover:text-white"
          >
            Wrap
          </button>
          <button
            onClick={onCopy}
            className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-300 hover:text-white"
          >
            Copy
          </button>
        </div>
      </div>

      {collapsed ? (
        <div className="px-4 py-3 text-xs italic text-gray-400">{lineCount} hidden lines</div>
      ) : (
        <div className="max-h-96 overflow-auto">
          <SyntaxHighlighter
            language={languageLabel}
            style={oneDark}
            customStyle={{ margin: 0, background: 'transparent', fontSize: '0.875rem' }}
            wrapLongLines={wrap}
            showLineNumbers={lineCount > 12}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
