import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeMathjax from 'rehype-mathjax';
import { CodeBlock as UiCodeBlock } from './CodeBlock';

// Splitter for special blocks: <think>...</think>, fenced code, and \\boxed{}
// Preprocessor to tidy model output (thought/answer, short text fences)
function preprocess(src: string): string {
  const thinkStart = /\*\*Pensamiento:\*\*/i;
  const answerStart = /\*\*Respuesta:\*\*/i;
  if (thinkStart.test(src)) {
    const idx = src.search(answerStart);
    if (idx >= 0) {
      const head = src.slice(0, idx).replace(thinkStart, '').trim();
      const tail = src.slice(idx + '**Respuesta:**'.length).trim();
      src = `<think>${head}</think>\n\n${tail}`;
    }
  }
  src = src.replace(/```(?:text|plaintext)?\n([\s\S]*?)```/g, (_m, body) => {
    const text = String(body || '').trim();
    const lines = text.split(/\n/);
    if (lines.length <= 2 && text.length <= 120) {
      const safe = text.replace(/`/g, '\u200B`');
      return '`' + safe + '`';
    }
    return '```\n' + body + '```';
  });
  src = src.replace(/^\s*\.$/gm, '');
  return src;
}function splitMarkdownBlocks(src: string) {
  const parts: Array<{ type: 'think' | 'code' | 'boxed' | 'text'; lang?: string; content: string }>
    = [];

  const matches: Array<{ index: number; type: 'think' | 'code' | 'boxed'; content: string; lang?: string }> = [];

  // <think> blocks
  const thinkRe = /<think>([\s\S]*?)<\/think>/gi;
  let m: RegExpExecArray | null;
  while ((m = thinkRe.exec(src))) {
    matches.push({ index: m.index, type: 'think', content: m[1] });
  }

  // fenced code ```lang\n...```
  const codeRe = /```(\w+)?\n?([\s\S]*?)```/g;
  while ((m = codeRe.exec(src))) {
    matches.push({ index: m.index, type: 'code', content: m[2], lang: m[1] });
  }

  // \\boxed{...}
  const boxedRe = /\\boxed\{([^}]+)\}/g;
  while ((m = boxedRe.exec(src))) {
    matches.push({ index: m.index, type: 'boxed', content: m[1] });
  }

  // sort by position
  matches.sort((a, b) => a.index - b.index);

  let last = 0;
  for (const match of matches) {
    if (match.index > last) {
      parts.push({ type: 'text', content: src.slice(last, match.index) });
    }
    parts.push({ type: match.type, content: match.content, lang: match.lang });

    const consumed = (() => {
      if (match.type === 'think') return `<think>${match.content}</think>`;
      if (match.type === 'boxed') return `\\boxed{${match.content}}`;
      const header = match.lang ? `\`\`\`${match.lang}\n` : '```';
      return `${header}${match.content}\`\`\``;
    })();
    last = match.index + consumed.length;
  }
  if (last < src.length) parts.push({ type: 'text', content: src.slice(last) });

  return parts;
}

// Collapsible <think> block
const ThinkBlock: React.FC<{ content: string } > = ({ content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-4 border border-gray-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-left text-sm text-gray-300 flex items-center justify-between transition-colors"
      >
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Pensamiento del modelo
        </span>
        <span className="text-xs opacity-70">{open ? 'Ocultar' : 'Mostrar'}</span>
      </button>
      {open && (
        <div className="px-4 py-3 bg-gray-900 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </div>
      )}
    </div>
  );
};

const BoxedBlock: React.FC<{ content: string }> = ({ content }) => (
  <div className="my-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
    <div className="text-center">
      <div className="text-2xl font-bold text-purple-300">{content}</div>
    </div>
  </div>
);

const CodeBlock: React.FC<{ content: string; language?: string }> = ({ content, language }) => (
  <UiCodeBlock language={language}>{content}</UiCodeBlock>
);

// Bloque especial para "plaintext": menos pesado, más legible
const PlaintextBlock: React.FC<{ content: string }> = ({ content }) => {
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(content); } catch {}
  };
  return (
    <div className="my-3 rounded-lg border border-amber-700 bg-amber-900/20 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-amber-700/60 bg-amber-800/40">
        <span className="text-xs font-medium text-amber-100 px-2 py-0.5 rounded bg-amber-700/70">plaintext</span>
        <button onClick={onCopy} className="text-xs text-amber-100/80 hover:text-white px-2 py-0.5 border border-amber-700 rounded">Copy</button>
      </div>
      <pre className="p-3 text-sm text-amber-100 whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
        {content}
      </pre>
    </div>
  );
};

const MermaidBlock: React.FC<{ code: string }> = ({ code }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ensure = () => new Promise<any>((resolve, reject) => {
          const w: any = window as any;
          if (w.mermaid) return resolve(w.mermaid);
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
          s.onload = () => resolve((window as any).mermaid);
          s.onerror = () => reject(new Error('Mermaid load error'));
          document.head.appendChild(s);
        });
        const mermaid: any = await ensure();
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });
        const id = `mmd-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Mermaid error');
      }
    })();
    return () => { cancelled = true; };
  }, [code]);
  if (error) return <UiCodeBlock language="mermaid">{code}</UiCodeBlock>;
  return <div ref={ref} className="my-3" />;
};

// Markdown via react-markdown (GFM + Math). Keeps whitespace.
function MarkdownText({ children }: { children: string }) {
  const content = useMemo(() => children.replace(/\\boxed\{([^}]+)\}/g, '**$1**'), [children]);

  const Code: React.FC<any> = ({ inline, className, children: codeChildren }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match?.[1];
    const text = String(codeChildren ?? '');
    if (inline) {
      return (
        <code className="inline-code whitespace-pre-wrap px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-200 border border-amber-700">
          {text}
        </code>
      );
    }
    return <UiCodeBlock language={language}>{text}</UiCodeBlock>;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw as any, rehypeMathjax as any]}
      components={{
        code: Code,
        p: ({ children }) => <p className="my-2 text-gray-200">{children}</p>,
        ul: ({ children }) => <ul className="my-2 list-disc pl-6 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="my-2 list-decimal pl-6 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        h1: ({ children }) => <h1 className="mt-4 mb-2 text-2xl font-semibold text-gray-100">{children}</h1>,
        h2: ({ children }) => <h2 className="mt-4 mb-2 text-xl font-semibold text-gray-100">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-3 mb-2 text-lg font-semibold text-gray-100">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-4 border-gray-600 pl-4 text-gray-300 italic">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto"><table className="min-w-full text-sm text-left border-collapse border border-gray-700">{children}</table></div>
        ),
        th: ({ children }) => <th className="border border-gray-700 px-3 py-2 bg-gray-800 text-gray-100">{children}</th>,
        td: ({ children }) => <td className="border border-gray-700 px-3 py-2 text-gray-200">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const blocks = splitMarkdownBlocks(preprocess(content));
  return (
    <div className="text-sm md:text-base leading-relaxed">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'think':
            return <ThinkBlock key={`think-${i}`} content={b.content} />;
          case 'code':
            if ((b.lang || '').toLowerCase() === 'mermaid') {
              return <MermaidBlock key={`mmd-${i}`} code={b.content} />;
            }
            // Heurística: si es un snippet corto de una sola línea, mostrar como inline code, no bloque grande
            const trimmed = (b.content || '').trim();
            const isSingleLine = trimmed.length > 0 && !trimmed.includes('\n') && trimmed.length <= 80;
            if (isSingleLine) {
              return (
                <code
                  key={`code-inline-${i}`}
                  className="inline-code px-1.5 py-0.5 rounded bg-amber-900/30 border border-amber-700 text-amber-200"
                >
                  {trimmed}
                </code>
              );
            }
            if ((b.lang || '').toLowerCase() === 'plaintext' || (b.lang || '').toLowerCase() === 'text') {
              return <PlaintextBlock key={`plain-${i}`} content={b.content} />;
            }
            return <CodeBlock key={`code-${i}`} content={b.content} language={b.lang} />;
          case 'boxed':
            return <BoxedBlock key={`boxed-${i}`} content={b.content} />;
          default:
            return (
              <div key={`md-${i}`} className="space-y-2 whitespace-pre-wrap break-words text-gray-200">
                <MarkdownText>{b.content}</MarkdownText>
              </div>
            );
        }
      })}
    </div>
  );
};



