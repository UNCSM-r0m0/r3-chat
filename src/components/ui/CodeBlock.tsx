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
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import visualBasic from 'react-syntax-highlighter/dist/esm/languages/prism/visual-basic';

SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('visual-basic', visualBasic);

const ALIASES: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  cs: 'csharp',
  'c#': 'csharp',
  py: 'python',
  'py3': 'python',
  'python3': 'python',
  'c++': 'cpp',
  'visual basic': 'visual-basic',
  vb: 'visual-basic',
  vbs: 'visual-basic',
  vbnet: 'visual-basic',
  text: 'plaintext',
};

const SUPPORTED_LANGUAGES = new Set([
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'bash',
  'json',
  'css',
  'markdown',
  'yaml',
  'c',
  'cpp',
  'csharp',
  'python',
  'java',
  'visual-basic',
]);

type CodeBlockProps = {
  language?: string;
  children: React.ReactNode;
};

const normalizeLanguage = (language?: string): string => {
  if (!language) return 'plaintext';

  const cleaned = language
    .toLowerCase()
    .replace(/^language-/, '')
    .trim()
    .split(/\s|\{|:/)[0];

  const lang = ALIASES[cleaned] || cleaned;
  if (SUPPORTED_LANGUAGES.has(lang)) return lang;
  return 'plaintext';
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
