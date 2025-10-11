import React from 'react';

/** Detección muy simple de code fences ```lang ... ```  */
function splitMarkdownBlocks(src: string) {
  const parts: Array<{ type: 'code' | 'text'; lang?: string; content: string }> = [];
  const fence = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = fence.exec(src))) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', content: src.slice(lastIndex, m.index) });
    }
    parts.push({ type: 'code', lang: m[1], content: m[2] });
    lastIndex = fence.lastIndex;
  }
  if (lastIndex < src.length) {
    parts.push({ type: 'text', content: src.slice(lastIndex) });
  }
  return parts;
}

function renderTextMarkdown(s: string) {
  // inline code
  let text = s
    .replace(/\r/g, '')
    .replace(/^\s+|\s+$/g, '');

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

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const blocks = splitMarkdownBlocks(content);
  return (
    <div className="markdown-body text-sm md:text-base leading-relaxed">
      {blocks.map((b, i) =>
        b.type === 'code' ? (
          <pre key={i} className="code-pre">
            <div className="code-lang">{b.lang || ''}</div>
            <code className="code-block">{b.content}</code>
          </pre>
        ) : (
          <div key={i} className="space-y-2">{renderTextMarkdown(b.content)}</div>
        )
      )}
    </div>
  );
};