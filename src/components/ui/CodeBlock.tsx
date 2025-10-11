import React from 'react';

export const CodeBlock: React.FC<{ language?: string; children: any }> = ({
  language = 'text',
  children,
}) => {
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 text-[11px] opacity-70 bg-muted px-2 py-0.5 rounded">
        {language}
      </div>
      <pre className="rounded-xl border p-3 md:p-4 overflow-x-auto whitespace-pre break-words">
        <code>{typeof children === 'string' ? children : children?.props?.children ?? ''}</code>
      </pre>
    </div>
  );
};