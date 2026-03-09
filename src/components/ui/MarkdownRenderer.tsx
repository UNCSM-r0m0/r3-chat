import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import { CodeBlock as UiCodeBlock } from './CodeBlock';

type BlockType = 'think' | 'code' | 'boxed' | 'text';

type MarkdownBlock = {
  type: BlockType;
  content: string;
  lang?: string;
};

type MermaidRenderResult = {
  svg: string;
};

type MermaidApi = {
  initialize: (config: { startOnLoad: boolean; theme: 'dark' | 'default' }) => void;
  render: (id: string, code: string) => Promise<MermaidRenderResult>;
};

declare global {
  interface Window {
    mermaid?: MermaidApi;
  }
}

function preprocess(source: string): string {
  let src = source;
  const thinkStart = /\*\*Pensamiento:\*\*/i;
  const answerStart = /\*\*Respuesta:\*\*/i;

  if (thinkStart.test(src)) {
    const answerIndex = src.search(answerStart);
    if (answerIndex >= 0) {
      const head = src.slice(0, answerIndex).replace(thinkStart, '').trim();
      const tail = src.slice(answerIndex + '**Respuesta:**'.length).trim();
      src = `<think>${head}</think>\n\n${tail}`;
    }
  }

  src = src.replace(/```(?:text|plaintext)?\n([\s\S]*?)```/g, (_match, body) => {
    const text = String(body || '').trim();
    const lines = text.split(/\n/);
    if (lines.length <= 2 && text.length <= 120) {
      const safe = text.replace(/`/g, '\u200B`');
      return '`' + safe + '`';
    }
    return `\`\`\`\n${String(body || '')}\`\`\``;
  });

  src = src.replace(/^\s*\.$/gm, '');
  return src;
}

function splitMarkdownBlocks(src: string): MarkdownBlock[] {
  const parts: MarkdownBlock[] = [];
  const matches: Array<{
    index: number;
    type: 'think' | 'code' | 'boxed';
    content: string;
    lang?: string;
    rawLen: number;
  }> = [];

  const thinkRe = /<think>([\s\S]*?)<\/think>/gi;
  let match: RegExpExecArray | null;
  while ((match = thinkRe.exec(src))) {
    matches.push({ index: match.index, type: 'think', content: match[1], rawLen: match[0].length });
  }

  const codeRe = /```([^\n\r`]*)?\r?\n([\s\S]*?)\r?\n?```/g;
  while ((match = codeRe.exec(src))) {
    const lang = (match[1] || '').trim() || undefined;
    matches.push({ index: match.index, type: 'code', content: match[2], lang, rawLen: match[0].length });
  }

  const boxedRe = /\\boxed\{([^}]+)\}/g;
  while ((match = boxedRe.exec(src))) {
    matches.push({ index: match.index, type: 'boxed', content: match[1], rawLen: match[0].length });
  }

  matches.sort((a, b) => a.index - b.index);

  let last = 0;
  for (const item of matches) {
    if (item.index > last) {
      parts.push({ type: 'text', content: src.slice(last, item.index) });
    }
    parts.push({ type: item.type, content: item.content, lang: item.lang });
    last = item.index + item.rawLen;
  }

  if (last < src.length) {
    parts.push({ type: 'text', content: src.slice(last) });
  }

  return parts;
}

const ThinkBlock: React.FC<{ content: string }> = ({ content }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-600">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between bg-gray-800 px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
      >
        <span className="flex items-center">
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Pensamiento del modelo
        </span>
        <span className="text-xs opacity-70">{open ? 'Ocultar' : 'Mostrar'}</span>
      </button>

      {open && (
        <div className="whitespace-pre-wrap break-words bg-gray-900 px-4 py-3 text-sm leading-relaxed text-gray-300">
          {content}
        </div>
      )}
    </div>
  );
};

const BoxedBlock: React.FC<{ content: string }> = ({ content }) => (
  <div className="my-4 rounded-lg border border-purple-500/30 bg-purple-900/20 p-4">
    <div className="text-center text-2xl font-bold text-purple-300">{content}</div>
  </div>
);

const PlaintextBlock: React.FC<{ content: string }> = ({ content }) => {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      void 0;
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-amber-700 bg-amber-900/20">
      <div className="flex items-center justify-between border-b border-amber-700/60 bg-amber-800/40 px-3 py-1.5">
        <span className="rounded bg-amber-700/70 px-2 py-0.5 text-xs font-medium text-amber-100">plaintext</span>
        <button onClick={onCopy} className="rounded border border-amber-700 px-2 py-0.5 text-xs text-amber-100/80 hover:text-white">
          Copy
        </button>
      </div>
      <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap break-words p-3 text-sm text-amber-100">{content}</pre>
    </div>
  );
};

const MermaidBlock: React.FC<{ code: string }> = ({ code }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const ensureMermaid = async (): Promise<MermaidApi> => {
      if (window.mermaid) return window.mermaid;

      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Mermaid load error'));
        document.head.appendChild(script);
      });

      if (!window.mermaid) {
        throw new Error('Mermaid not available after script load');
      }

      return window.mermaid;
    };

    (async () => {
      try {
        const mermaid = await ensureMermaid();
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });
        const id = `mmd-${Math.random().toString(36).slice(2)}`;
        const result = await mermaid.render(id, code);

        if (!cancelled && ref.current) {
          ref.current.innerHTML = result.svg;
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Mermaid error';
          setError(message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) return <UiCodeBlock language="mermaid">{code}</UiCodeBlock>;
  return <div ref={ref} className="my-3" />;
};

function MarkdownText({ children }: { children: string }) {
  const content = useMemo(() => children.replace(/\\boxed\{([^}]+)\}/g, '**$1**'), [children]);

  const safeUrlTransform = (url: string): string => {
    const value = String(url || '').trim();
    if (!value) return '';

    const lower = value.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
      return '';
    }

    return value;
  };

  const Code = ({ inline, className, children: codeChildren }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
    const cls = String(className || '');
    const language = cls.includes('language-') ? cls.split('language-')[1]?.split(' ')[0]?.toLowerCase() : undefined;
    const text = String(codeChildren ?? '');

    if (inline) {
      return (
        <code className="inline-code whitespace-pre-wrap rounded border border-amber-700 bg-amber-900/30 px-1.5 py-0.5 text-amber-200">
          {text}
        </code>
      );
    }

    if (language === 'plaintext' || language === 'text' || language === 'txt') {
      return <PlaintextBlock content={text} />;
    }

    const trimmed = text.trim();
    if (!language && trimmed.length > 0 && !trimmed.includes('\n') && trimmed.length <= 120) {
      return (
        <div className="my-2">
          <code className="inline-code rounded border border-amber-700 bg-amber-900/30 px-2 py-1 text-amber-200">{trimmed}</code>
        </div>
      );
    }

    return <UiCodeBlock language={language}>{text}</UiCodeBlock>;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeMathjax]}
      skipHtml
      urlTransform={safeUrlTransform}
      allowedElements={[
        'p',
        'br',
        'strong',
        'em',
        'del',
        'blockquote',
        'code',
        'pre',
        'ul',
        'ol',
        'li',
        'hr',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'a',
        'img',
        'span',
      ]}
      components={{
        code: Code,
        a: ({ href, children: nodeChildren }) => {
          const safeHref = safeUrlTransform(href || '');
          return (
            <a
              href={safeHref || undefined}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-cyan-300 underline decoration-cyan-500/50 hover:text-cyan-200"
            >
              {nodeChildren}
            </a>
          );
        },
        img: ({ src, alt }) => {
          const safeSrc = safeUrlTransform(src || '');
          if (!safeSrc) return null;
          return <img src={safeSrc} alt={alt || ''} loading="lazy" className="my-2 max-h-96 rounded border border-gray-700" />;
        },
        p: ({ children: nodeChildren }) => <p className="my-2 text-gray-200">{nodeChildren}</p>,
        ul: ({ children: nodeChildren }) => <ul className="my-2 list-disc space-y-1 pl-6">{nodeChildren}</ul>,
        ol: ({ children: nodeChildren }) => <ol className="my-2 list-decimal space-y-1 pl-6">{nodeChildren}</ol>,
        li: ({ children: nodeChildren }) => <li className="leading-relaxed">{nodeChildren}</li>,
        h1: ({ children: nodeChildren }) => <h1 className="mb-2 mt-4 text-2xl font-semibold text-gray-100">{nodeChildren}</h1>,
        h2: ({ children: nodeChildren }) => <h2 className="mb-2 mt-4 text-xl font-semibold text-gray-100">{nodeChildren}</h2>,
        h3: ({ children: nodeChildren }) => <h3 className="mb-2 mt-3 text-lg font-semibold text-gray-100">{nodeChildren}</h3>,
        blockquote: ({ children: nodeChildren }) => (
          <blockquote className="my-3 border-l-4 border-gray-600 pl-4 italic text-gray-300">{nodeChildren}</blockquote>
        ),
        table: ({ children: nodeChildren }) => (
          <div className="my-3 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-700 text-left text-sm">{nodeChildren}</table>
          </div>
        ),
        th: ({ children: nodeChildren }) => <th className="border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100">{nodeChildren}</th>,
        td: ({ children: nodeChildren }) => <td className="border border-gray-700 px-3 py-2 text-gray-200">{nodeChildren}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const blocks = splitMarkdownBlocks(preprocess(content));

  return (
    <div className="text-sm leading-relaxed md:text-base">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'think': {
            return <ThinkBlock key={`think-${index}`} content={block.content} />;
          }
          case 'code': {
            const lang = (block.lang || '').toLowerCase();

            if (lang === 'mermaid') {
              return <MermaidBlock key={`mmd-${index}`} code={block.content} />;
            }

            const trimmed = block.content.trim();
            const nonEmptyLines = trimmed.split('\n').filter((line) => line.trim().length > 0);
            const isCompact = nonEmptyLines.length <= 1 && trimmed.length <= 140;

            if (isCompact) {
              return (
                <code
                  key={`code-inline-${index}`}
                  className="inline-code rounded border border-amber-700 bg-amber-900/30 px-1.5 py-0.5 text-amber-200"
                >
                  {trimmed}
                </code>
              );
            }

            if (lang === 'plaintext' || lang === 'text') {
              return <PlaintextBlock key={`plain-${index}`} content={block.content} />;
            }

            return <UiCodeBlock key={`code-${index}`} language={block.lang}>{block.content}</UiCodeBlock>;
          }
          case 'boxed': {
            return <BoxedBlock key={`boxed-${index}`} content={block.content} />;
          }
          default: {
            return (
              <div key={`md-${index}`} className="space-y-2 whitespace-pre-wrap break-words text-gray-200">
                <MarkdownText>{block.content}</MarkdownText>
              </div>
            );
          }
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;
