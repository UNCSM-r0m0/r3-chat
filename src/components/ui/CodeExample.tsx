import React from 'react';
import { CodeBlock } from './CodeBlock';

export const CodeExample: React.FC = () => {
  const exampleCode = `// Ejemplo de código JavaScript con resaltado de sintaxis
function saludar(nombre) {
  const mensaje = \`¡Hola, \${nombre}!\`;
  console.log(mensaje);
  return mensaje;
}

// Función asíncrona con async/await
async function obtenerDatos() {
  try {
    const respuesta = await fetch('/api/datos');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Clase ES6
class Usuario {
  constructor(nombre, email) {
    this.nombre = nombre;
    this.email = email;
  }
  
  saludar() {
    return \`Hola, soy \${this.nombre}\`;
  }
}

// Uso de la función
saludar('R3.chat');
obtenerDatos();
const usuario = new Usuario('Juan', 'juan@ejemplo.com');
console.log(usuario.saludar());`;

  const htmlCode = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>R3.chat - Ejemplo</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>¡Bienvenido a R3.chat!</h1>
        <p>Tu asistente de IA con resaltado de sintaxis.</p>
    </div>
</body>
</html>`;

  const cssCode = `/* Estilos para R3.chat */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #333;
  background: #2a2a2a;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.message.user {
  background: #7c3aed;
  margin-left: auto;
  max-width: 80%;
}

.message.assistant {
  background: #374151;
  margin-right: auto;
  max-width: 80%;
}

.code-block {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 0.5rem;
  overflow: hidden;
  margin: 1rem 0;
}`;

  return (
    <div className="space-y-6 p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">
        Ejemplos de Resaltado de Sintaxis
      </h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            JavaScript/TypeScript
          </h3>
          <CodeBlock language="javascript">
            {exampleCode}
          </CodeBlock>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            HTML
          </h3>
          <CodeBlock language="html">
            {htmlCode}
          </CodeBlock>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            CSS
          </h3>
          <CodeBlock language="css">
            {cssCode}
          </CodeBlock>
        </div>
      </div>
    </div>
  );
};
