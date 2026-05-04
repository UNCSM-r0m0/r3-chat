import type { ArtifactFile } from '../stores/artifactStore';

interface BundledProject {
  html: string;
  errors: string[];
}

// CDN URLs for dependencies
const CDN_DEPS = {
  react: 'https://esm.sh/react@19',
  reactDom: 'https://esm.sh/react-dom@19/client',
  framerMotion: 'https://esm.sh/framer-motion@11',
  lucideReact: 'https://esm.sh/lucide-react@0.460',
};

/**
 * Bundles a multi-file React project into a single executable HTML
 */
export function bundleProject(files: ArtifactFile[]): BundledProject {
  const errors: string[] = [];
  const fileMap = new Map(files.map(f => [f.path, f]));
  
  // Find entry point
  const entryFile = files.find(f => f.path === 'src/main.tsx') || files.find(f => f.path === 'src/main.jsx');
  if (!entryFile) {
    errors.push('No entry point found (src/main.tsx or src/main.jsx)');
    return { html: generateErrorHTML(errors), errors };
  }
  
  // Find index.html
  const indexHtml = files.find(f => f.path === 'index.html');
  
  // Transform all TSX/TS files to JS
  const transformedFiles = new Map<string, string>();
  
  files.forEach(file => {
    if (file.path.endsWith('.tsx') || file.path.endsWith('.ts') || file.path.endsWith('.jsx')) {
      try {
        const transformed = transformFile(file, fileMap, errors);
        const jsPath = file.path.replace(/\.tsx?$/, '.js').replace(/\.jsx$/, '.js');
        transformedFiles.set(jsPath, transformed);
      } catch (err) {
        errors.push(`Error transforming ${file.path}: ${err}`);
      }
    }
  });
  
  // Find CSS files
  const cssFiles = files.filter(f => f.path.endsWith('.css'));
  
  // Generate HTML
  const html = generateHTML(indexHtml, entryFile, transformedFiles, cssFiles, files, errors);
  
  return { html, errors };
}

function transformFile(file: ArtifactFile, _fileMap: Map<string, ArtifactFile>, _errors: string[]): string {
  let code = file.content;
  
  // Remove TypeScript type annotations (simple regex approach)
  code = code.replace(/:\s*[A-Z][a-zA-Z0-9<>[\]|&]*(<[^\u003e]*>)?/g, ''); // Type annotations
  code = code.replace(/interface\s+\w+\s*\{[^}]*\}/g, ''); // Interfaces
  code = code.replace(/type\s+\w+\s*=\s*[^;]+;/g, ''); // Type aliases
  code = code.replace(/as\s+[A-Z][a-zA-Z0-9<>[\]|&]*/g, ''); // Type assertions
  code = code.replace(/export\s+type\s+[^;]+;/g, ''); // Export types
  code = code.replace(/import\s+type\s+[^;]+;/g, ''); // Import types
  
  // Transform imports to be resolvable
  code = code.replace(
    /import\s+(?:(\{[^}]*\})|(\w+)|(\*\s+as\s+\w+))\s+from\s+['"]([^'"]+)['"];?/g,
    (_match, namedImports, defaultImport, namespaceImport, importPath) => {
      // External dependencies - map to CDN
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        if (importPath === 'react' || importPath.startsWith('react/')) {
          return `import ${defaultImport || namedImports || namespaceImport} from '${CDN_DEPS.react}';`;
        }
        if (importPath === 'react-dom/client') {
          return `import ${defaultImport || namedImports || namespaceImport} from '${CDN_DEPS.reactDom}';`;
        }
        if (importPath === 'framer-motion') {
          return `import ${defaultImport || namedImports || namespaceImport} from '${CDN_DEPS.framerMotion}';`;
        }
        if (importPath === 'lucide-react') {
          return `import ${defaultImport || namedImports || namespaceImport} from '${CDN_DEPS.lucideReact}';`;
        }
        // For other external deps, try esm.sh
        return `import ${defaultImport || namedImports || namespaceImport} from 'https://esm.sh/${importPath}';`;
      }
      
      // Local imports - resolve to JS path
      let resolvedPath = importPath;
      if (resolvedPath.endsWith('.tsx') || resolvedPath.endsWith('.ts') || resolvedPath.endsWith('.jsx')) {
        resolvedPath = resolvedPath.replace(/\.tsx?$/, '.js').replace(/\.jsx$/, '.js');
      } else if (!resolvedPath.endsWith('.js')) {
        resolvedPath += '.js';
      }
      
      return `import ${defaultImport || namedImports || namespaceImport} from '${resolvedPath}';`;
    }
  );
  
  // Handle export default function -> function + export
  code = code.replace(
    /export\s+default\s+function\s+(\w+)/g,
    'function $1'
  );
  code = code.replace(
    /export\s+default\s+(\w+)/g,
    (_match, name) => {
      return `/* export default ${name} */`;
    }
  );
  
  // Add export at end of file for default exports
  if (file.content.includes('export default')) {
    const defaultExportMatch = file.content.match(/export\s+default\s+(\w+)/);
    if (defaultExportMatch) {
      code += `\nexport default ${defaultExportMatch[1]};`;
    }
  }
  
  // Simple JSX transformation (very basic)
  code = code.replace(/className=/g, 'class=');
  
  return code;
}

function generateHTML(
  indexHtml: ArtifactFile | undefined,
  _entryFile: ArtifactFile,
  transformedFiles: Map<string, string>,
  cssFiles: ArtifactFile[],
  _allFiles: ArtifactFile[],
  _errors: string[]
): string {
  
  // If there's an index.html, use it as base
  let htmlContent = indexHtml?.content || `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Landing Page</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
    </html>
  `;
  
  // Inject CSS
  const cssContent = cssFiles.map(f => `/* ${f.path} */\n${f.content}`).join('\n\n');
  const styleTag = `<style>${cssContent}</style>`;
  
  // Inject transformed JS as modules
  const jsModules: string[] = [];
  transformedFiles.forEach((code, path) => {
    jsModules.push(`
// ${path}
${code}
    `);
  });
  
  const scriptContent = `
<script type="module">
${jsModules.join('\n')}

// Bootstrap React app
import { createRoot } from '${CDN_DEPS.reactDom}';
import App from './src/App.js';
import React from '${CDN_DEPS.react}';

createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
</script>
  `;
  
  // Insert style and script into HTML
  htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);
  htmlContent = htmlContent.replace('</body>', `${scriptContent}\n</body>`);
  
  return htmlContent;
}

function generateErrorHTML(errors: string[]): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Error</title></head>
    <body style="font-family: sans-serif; padding: 20px; color: red;">
      <h1>Error bundling project</h1>
      <ul>
        ${errors.map(e => `<li>${e}</li>`).join('')}
      </ul>
    </body>
    </html>
  `;
}

export default bundleProject;
