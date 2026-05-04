import type { ArtifactFile } from '../stores/artifactStore';

interface BundledProject {
  html: string;
  errors: string[];
}

/**
 * Bundles a multi-file React project into a single executable HTML.
 * Uses Babel standalone in the iframe to transform JSX/TypeScript,
 * then creates blob URLs for local imports with an import map.
 */
export function bundleProject(files: ArtifactFile[]): BundledProject {
  const errors: string[] = [];

  // Validate files
  if (!files || files.length === 0) {
    errors.push('No hay archivos para compilar');
    return { html: generateErrorHTML(errors), errors };
  }

  // Single file: return as-is if it's HTML
  if (files.length === 1) {
    const file = files[0];
    if (file.path.endsWith('.html')) {
      return { html: file.content, errors: [] };
    }
  }

  // Find entry point
  const entryFile = files.find(f => f.path === 'src/main.tsx')
    || files.find(f => f.path === 'src/main.jsx')
    || files.find(f => f.path.endsWith('.tsx') || f.path.endsWith('.jsx'));

  if (!entryFile) {
    errors.push('No se encontró punto de entrada (src/main.tsx, src/main.jsx, o cualquier .tsx/.jsx)');
    return { html: generateErrorHTML(errors), errors };
  }

  // Check for circular imports (basic check)
  const importMap = new Map<string, string[]>();
  for (const file of files) {
    if (file.path.endsWith('.tsx') || file.path.endsWith('.ts') || file.path.endsWith('.jsx')) {
      const imports: string[] = [];
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"];?/g;
      let match;
      while ((match = importRegex.exec(file.content)) !== null) {
        if (match[1].startsWith('.')) {
          imports.push(match[1]);
        }
      }
      importMap.set(file.path, imports);
    }
  }

  // Detect circular imports
  function hasCircularImport(start: string, target: string, visited: Set<string> = new Set()): boolean {
    if (visited.has(start)) return false;
    visited.add(start);
    const imports = importMap.get(start) || [];
    for (const imp of imports) {
      const resolved = resolveImportPath(start, imp);
      if (resolved === target) return true;
      // Check all files that might match this import
      for (const [path] of importMap) {
        if (path === resolved || path.startsWith(resolved)) {
          if (hasCircularImport(path, target, new Set(visited))) return true;
        }
      }
    }
    return false;
  }

  for (const [path] of importMap) {
    if (hasCircularImport(path, path)) {
      errors.push(`Import circular detectado en ${path}`);
    }
  }

  const codeFiles = files.filter(f => !f.path.endsWith('.css') && !f.path.endsWith('.html'));
  const cssFiles = files.filter(f => f.path.endsWith('.css'));
  const indexHtml = files.find(f => f.path === 'index.html');

  const html = generateHTML({
    indexHtml,
    entryFile: entryFile.path,
    codeFiles,
    cssFiles,
    errors,
  });

  return { html, errors };
}

function resolveImportPath(from: string, to: string): string {
  if (!to.startsWith('.')) return to;
  const parts = from.split('/');
  parts.pop();
  const toParts = to.split('/');
  for (const part of toParts) {
    if (part === '..') parts.pop();
    else if (part !== '.') parts.push(part);
  }
  return parts.join('/');
}

interface GenerateHTMLOptions {
  indexHtml?: ArtifactFile;
  entryFile: string;
  codeFiles: ArtifactFile[];
  cssFiles: ArtifactFile[];
  errors: string[];
}

function generateHTML(options: GenerateHTMLOptions): string {
  const { indexHtml, entryFile, codeFiles, cssFiles } = options;

  const cssContent = cssFiles.map(f => f.content).join('\n\n');
  const filesJson: Record<string, string> = {};
  codeFiles.forEach(f => {
    filesJson[f.path] = f.content;
  });

  const htmlContent = indexHtml?.content || `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

  const runtime = generateRuntime(filesJson, entryFile);

  let result = htmlContent;
  result = result.replace('</head>', `<style>${cssContent}</style>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>`);
  result = result.replace('</body>', `${runtime}
</body>`);

  return result;
}

function generateRuntime(filesJson: Record<string, string>, entryFile: string): string {
  return `
<script type="module">
(async function() {
  // Project files
  const __FILES__ = ${JSON.stringify(filesJson)};

  // External dependencies
  const __EXTERNALS__ = {
    'react': 'https://esm.sh/react@19',
    'react-dom/client': 'https://esm.sh/react-dom@19/client',
    'framer-motion': 'https://esm.sh/framer-motion@11',
    'lucide-react': 'https://esm.sh/lucide-react@0.460',
  };

  // Transform files with Babel
  const __TRANSFORMED__ = {};
  for (const [path, code] of Object.entries(__FILES__)) {
    if (path.endsWith('.tsx') || path.endsWith('.ts') || path.endsWith('.jsx')) {
      try {
        const result = Babel.transform(code, {
          presets: ['react', 'typescript'],
          filename: path,
        });
        const jsPath = path.replace(/\.tsx?$/, '.js').replace(/\.jsx$/, '.js');
        __TRANSFORMED__[jsPath] = result.code;
      } catch (e) {
        console.error('Error transformando', path, e);
        __TRANSFORMED__[path] = code;
      }
    } else {
      __TRANSFORMED__[path] = code;
    }
  }

  // Create blob URLs for local modules
  const __BLOBS__ = {};
  for (const [path, code] of Object.entries(__TRANSFORMED__)) {
    const blob = new Blob([code], { type: 'application/javascript' });
    __BLOBS__[path] = URL.createObjectURL(blob);
  }

  // Build import map
  const imports = {};
  for (const [name, url] of Object.entries(__EXTERNALS__)) {
    imports[name] = url;
  }

  // Map local files to blob URLs
  for (const path of Object.keys(__BLOBS__)) {
    imports['./' + path] = __BLOBS__[path];
    imports['./' + path.replace(/\.js$/, '')] = __BLOBS__[path];
  }

  // Inject import map
  const importMapScript = document.createElement('script');
  importMapScript.type = 'importmap';
  importMapScript.textContent = JSON.stringify({ imports });
  document.head.appendChild(importMapScript);

  // Import and execute entry point
  const entryPath = './' + entryFile.replace(/\.tsx$/, '.js').replace(/\.ts$/, '.js').replace(/\.jsx$/, '.js');

  try {
    const entryModule = await import(entryPath);

    // Bootstrap React app
    if (entryModule.default) {
      const React = await import('https://esm.sh/react@19');
      const ReactDOM = await import('https://esm.sh/react-dom@19/client');
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(entryModule.default));
    }
  } catch (e) {
    console.error('Error ejecutando entry point:', e);
    document.getElementById('root').innerHTML = '<div style="color:red;padding:20px">Error: ' + e.message + '</div>';
  }
})();
</script>`;
}

function generateErrorHTML(errors: string[]): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Error</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; background: #0a0a0a; color: #ff4444; }
    h1 { font-size: 24px; margin-bottom: 20px; }
    ul { list-style: none; padding: 0; }
    li { padding: 8px 0; border-bottom: 1px solid #333; }
  </style>
</head>
<body>
  <h1>⚠️ Error al compilar el proyecto</h1>
  <ul>
    ${errors.map(e => `<li>${e}</li>`).join('')}
  </ul>
</body>
</html>`;
}

export default bundleProject;
