import { MarkdownRenderer } from './MarkdownRenderer';

export const MarkdownTest = () => {
  const testContent = `### Título de prueba

Este es un **texto en negrita** y este es *texto en cursiva*.

1. Primer elemento de lista
2. Segundo elemento de lista
3. Tercer elemento de lista

\`\`\`javascript
console.log("Hola mundo");
const x = 5;
\`\`\`

Este es código inline: \`const y = 10\`

[Este es un enlace](https://example.com)`;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Test MarkdownRenderer:</h2>
      <MarkdownRenderer content={testContent} />
    </div>
  );
};
