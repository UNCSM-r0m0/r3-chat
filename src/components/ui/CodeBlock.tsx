import React from 'react';
import { Copy, Check, ChevronDown, ChevronUp, WrapText } from 'lucide-react';
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
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
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
SyntaxHighlighter.registerLanguage('markup', markup);
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
  html: 'markup',
  htm: 'markup',
  xml: 'markup',
  svg: 'markup',
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
  'markup',
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
  const [copied, setCopied] = React.useState(false);
  const code = extractCode(children);
  const languageLabel = normalizeLanguage(language);
  const lineCount = React.useMemo(() => code.split('\n').length, [code]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      void 0;
    }
  };

  return (
    <div className="my-4 rounded-xl border border-white/[0.06] bg-[#0d0d0d] overflow-hidden">
      {/* Header - estilo T3 minimalista */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          {languageLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setWrap((prev) => !prev)}
            className={`p-1.5 rounded-lg transition-colors ${wrap ? 'text-zinc-300 bg-white/[0.08]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]'}`}
            title="Ajustar texto"
          >
            <WrapText className="w-4 h-4" />
          </button>
          <button
            onClick={onCopy}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
            title="Copiar"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {collapsed ? (
        <div className="px-4 py-3 text-xs text-zinc-500 italic">
          {lineCount} líneas ocultas
        </div>
      ) : (
        <div className="max-h-[500px] overflow-auto">
          <SyntaxHighlighter
            language={languageLabel}
            style={oneDark}
            customStyle={{ 
              margin: 0, 
              background: 'transparent', 
              fontSize: '0.8125rem',
              padding: '1rem 1.25rem'
            }}
            wrapLongLines={wrap}
            showLineNumbers={lineCount > 8}
            lineNumberStyle={{ 
              color: '#52525b', 
              minWidth: '2.5em',
              paddingRight: '1em'
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
