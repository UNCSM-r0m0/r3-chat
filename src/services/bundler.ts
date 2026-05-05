import type { ArtifactFile } from '../stores/artifactStore';

interface BundledProject {
  html: string;
  errors: string[];
}

const SOURCE_FILE_RE = /^src\/.*\.(tsx|ts|jsx|js)$/;

const isRunnableSourceFile = (file: ArtifactFile): boolean => SOURCE_FILE_RE.test(file.path);

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

  const codeFiles = files.filter(isRunnableSourceFile);
  const cssFiles = files.filter(f => f.path.endsWith('.css'));
  const indexHtml = files.find(f => f.path === 'index.html');

  const html = generateHTML({
    indexHtml,
    entryFile: entryFile.path,
    codeFiles,
    cssFiles,
    allFiles: files,
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
  allFiles: ArtifactFile[];
  errors: string[];
}

function generateHTML(options: GenerateHTMLOptions): string {
  const { indexHtml, entryFile, codeFiles, cssFiles, allFiles } = options;

  const cssContent = cssFiles.map(f => sanitizeCss(f.content)).filter(Boolean).join('\n\n');
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
  // The generated Vite index.html usually points to /src/main.tsx.
  // In srcDoc that URL is not a real filesystem, so the preview runtime owns bootstrapping.
  result = result.replace(/<script\b[^>]*\bsrc=["']\/?src\/[^"']+["'][^>]*>\s*<\/script>/gi, '');
  // Extract tailwind config for sandbox preview
  const tailwindConfig = allFiles.find(f => 
    /tailwind\.config\.(js|ts|cjs|mjs)$/i.test(f.path)
  );
  
  let tailwindConfigScript = '';
  if (tailwindConfig) {
    let configContent = tailwindConfig.content;
    
    // Remove ALL comments (both block and line comments)
    configContent = configContent
      .replace(/\/\*[\s\S]*?\*\//g, '')  // Block comments /* ... */
      .replace(/\/\/.*$/gm, '');          // Line comments // ...
    
    // Remove import/export statements that break in browser
    configContent = configContent
      .replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/^const\s+\w+\s*=\s*require\(['"][^'"]+['"]\);?\s*$/gm, '');
    
    // Convert ES module or CommonJS export to tailwind.config assignment
    configContent = configContent
      .replace(/export\s+default\s+/, 'tailwind.config = ')
      .replace(/module\.exports\s*=\s*/, 'tailwind.config = ');
    
    // Clean up empty lines
    configContent = configContent.replace(/\n\s*\n/g, '\n').trim();
    
    tailwindConfigScript = `<script>
  try {
    ${configContent}
    console.log('[Tailwind Config] Loaded successfully');
    console.log('[Tailwind Config] Theme keys:', Object.keys(tailwind.config?.theme?.extend || {}));
  } catch (e) {
    console.error('[Tailwind Config] Failed to load:', e.message);
  }
</script>`;
  } else {
    console.warn('[Tailwind Config] No tailwind.config.js/ts found in artifact files');
  }

  const previewHead = `<script src="https://cdn.tailwindcss.com"></script>
${tailwindConfigScript}
${cssContent ? `<style>${cssContent}</style>` : ''}
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>`;
  if (/<\/head>/i.test(result)) {
    result = result.replace(/<\/head>/i, `${previewHead}
</head>`);
  } else {
    result = result.replace(/<body/i, `<head>${previewHead}</head>
<body`);
  }
  result = result.replace('</body>', `${runtime}
</body>`);

  return result;
}

function sanitizeCss(css: string): string {
  return css
    .replace(/@tailwind\s+(base|components|utilities);?/gi, '')
    .replace(/@import\s+['"]tailwindcss['"];?/gi, '')
    .replace(/@config\s+['"][^'"]+['"];?/gi, '')
    .trim();
}

function generateRuntime(filesJson: Record<string, string>, entryFile: string): string {
  return `
<script type="module">
(async function() {
  const __FILES__ = ${JSON.stringify(filesJson)};

  const __EXTERNALS__ = {
    'react': 'https://esm.sh/react@19',
    'react-dom/client': 'https://esm.sh/react-dom@19/client',
    'framer-motion': 'https://esm.sh/framer-motion@11',
    'lucide-react': 'https://esm.sh/lucide-react@0.460',
    'clsx': 'https://esm.sh/clsx@2',
    'class-variance-authority': 'https://esm.sh/class-variance-authority@0.7',
    'tailwind-merge': 'https://esm.sh/tailwind-merge@2',
  };

  const __ERRORS__ = [];
  const __TRANSFORMED__ = {};

  function toJsPath(path) {
    return path.replace(/\\.tsx?$/, '.js').replace(/\\.jsx$/, '.js');
  }

  function dirname(path) {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
  }

  function normalizePath(path) {
    const parts = [];
    for (const part of path.replace(/^\\/+/, '').split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') parts.pop();
      else parts.push(part);
    }
    return parts.join('/');
  }

  function resolveLocalSpecifier(fromPath, specifier) {
    if (!specifier || specifier.startsWith('http://') || specifier.startsWith('https://')) return null;
    if (!specifier.startsWith('.') && !specifier.startsWith('/src/') && !specifier.startsWith('@/')) return null;
    if (/\\.css(?:\\?|$)/.test(specifier)) return { css: true };

    let base;
    if (specifier.startsWith('@/')) {
      base = 'src/' + specifier.slice(2);
    } else if (specifier.startsWith('/src/')) {
      base = specifier.slice(1);
    } else {
      base = normalizePath(dirname(fromPath) + '/' + specifier);
    }

    const candidates = [
      base,
      base + '.js',
      base + '.jsx',
      base + '.ts',
      base + '.tsx',
      base + '/index.js',
      base + '/index.jsx',
      base + '/index.ts',
      base + '/index.tsx',
    ];

    for (const candidate of candidates) {
      const jsPath = toJsPath(candidate);
      if (__TRANSFORMED__[jsPath]) return { path: jsPath };
    }

    return null;
  }

  function guessLocalJsPath(fromPath, specifier) {
    if (!specifier || (!specifier.startsWith('.') && !specifier.startsWith('/src/') && !specifier.startsWith('@/'))) {
      return null;
    }
    if (/\\.css(?:\\?|$)/.test(specifier)) return null;

    let base;
    if (specifier.startsWith('@/')) {
      base = 'src/' + specifier.slice(2);
    } else if (specifier.startsWith('/src/')) {
      base = specifier.slice(1);
    } else {
      base = normalizePath(dirname(fromPath) + '/' + specifier);
    }

    const jsPath = toJsPath(base.replace(/\\.(tsx|ts|jsx|js)$/, '.js'));
    return /\\.js$/.test(jsPath) ? jsPath : jsPath + '.js';
  }

  function sandboxSpecifier(path) {
    return 'sandbox:' + path;
  }

  function ensureFallbackForMissingModule(path) {
    if (!path || __TRANSFORMED__[path]) return path;
    __TRANSFORMED__[path] = [
      "import React from 'react';",
      "function MissingGeneratedComponent() {",
      "  return React.createElement('div', { style: { padding: '24px', color: '#ef4444', fontFamily: 'system-ui' } },",
      "    'Componente generado faltante: " + path.replace(/'/g, "\\'") + "'",
      "  );",
      "}",
      "export default MissingGeneratedComponent;"
    ].join('\\n');
    return path;
  }

  function rewriteLocalImports(path, code) {
    let output = code;

    output = output.replace(/import\\s+['\"][^'\"]+\\.css(?:\\?[^'\"]*)?['\"];?\\s*/g, '');

    output = output.replace(/(from\\s*['\"])([^'\"]+)(['\"])/g, function(match, prefix, specifier, suffix) {
      const resolved = resolveLocalSpecifier(path, specifier);
      if (!resolved) {
        const guessed = guessLocalJsPath(path, specifier);
        if (guessed) return prefix + sandboxSpecifier(ensureFallbackForMissingModule(guessed)) + suffix;
        return match;
      }
      if (resolved.css) return prefix + specifier + suffix;
      return prefix + sandboxSpecifier(resolved.path) + suffix;
    });

    output = output.replace(/(import\\s*\\(\\s*['\"])([^'\"]+)(['\"]\\s*\\))/g, function(match, prefix, specifier, suffix) {
      const resolved = resolveLocalSpecifier(path, specifier);
      if (!resolved) {
        const guessed = guessLocalJsPath(path, specifier);
        if (guessed) return prefix + sandboxSpecifier(ensureFallbackForMissingModule(guessed)) + suffix;
        return match;
      }
      if (resolved.css) return match;
      return prefix + sandboxSpecifier(resolved.path) + suffix;
    });

    output = output.replace(/(import\\s*['\"])([^'\"]+)(['\"])/g, function(match, prefix, specifier, suffix) {
      const resolved = resolveLocalSpecifier(path, specifier);
      if (!resolved) {
        const guessed = guessLocalJsPath(path, specifier);
        if (guessed) return prefix + sandboxSpecifier(ensureFallbackForMissingModule(guessed)) + suffix;
        return match;
      }
      if (resolved.css) return '';
      return prefix + sandboxSpecifier(resolved.path) + suffix;
    });

    return output;
  }

  function ensureReactImport(code) {
    if (!code.includes('React.')) return code;
    if (/import\\s+React\\b/.test(code)) return code;
    return "import React from 'react';\\n" + code;
  }

  function transformCode(path, code, presets) {
    const result = Babel.transform(code, {
      presets,
      filename: path,
    });
    return ensureReactImport(result.code || '');
  }

  function createFallbackModule(path, code, error) {
    const componentName = 'BrokenGeneratedComponent';
    const safePath = JSON.stringify(path);
    const safeError = JSON.stringify(error && error.message ? error.message : String(error || 'Error desconocido'));
    const namedExports = [];
    const exportRegex = /export\\s+(?:function|const|let|var|class)\\s+([A-Za-z_$][\\w$]*)/g;
    let exportMatch;
    while ((exportMatch = exportRegex.exec(code || '')) !== null) {
      if (exportMatch[1] !== componentName && !namedExports.includes(exportMatch[1])) {
        namedExports.push(exportMatch[1]);
      }
    }
    return [
      "import React from 'react';",
      "const message = " + safeError + ";",
      "function " + componentName + "() {",
      "  return React.createElement('div', { style: { padding: '24px', color: '#ef4444', fontFamily: 'system-ui' } },",
      "    'No se pudo compilar ' + " + safePath + " + ': ' + message",
      "  );",
      "}",
      ...namedExports.map(function(name) {
        return "export const " + name + " = " + componentName + ";";
      }),
      "export default " + componentName + ";"
    ].join('\\n');
  }

  for (const [path, code] of Object.entries(__FILES__)) {
    try {
      __TRANSFORMED__[toJsPath(path)] = transformCode(path, code, ['react', 'typescript']);
    } catch (e) {
      try {
        __TRANSFORMED__[toJsPath(path)] = transformCode(path, code, ['react']);
      } catch (e2) {
        __ERRORS__.push('Babel failed for ' + path + ': ' + (e2 && e2.message ? e2.message : e2));
        __TRANSFORMED__[toJsPath(path)] = createFallbackModule(path, code, e2);
      }
    }
  }

  for (const path of Object.keys(__TRANSFORMED__)) {
    __TRANSFORMED__[path] = rewriteLocalImports(path, __TRANSFORMED__[path]);
  }

  if (__ERRORS__.length > 0) {
    console.warn('Bundler warnings:', __ERRORS__);
  }

  const __BLOBS__ = {};
  for (const [path, code] of Object.entries(__TRANSFORMED__)) {
    const blob = new Blob([code], { type: 'application/javascript' });
    __BLOBS__[path] = URL.createObjectURL(blob);
  }

  const imports = {};
  for (const [name, url] of Object.entries(__EXTERNALS__)) {
    imports[name] = url;
  }

  for (const [path, url] of Object.entries(__BLOBS__)) {
    imports['sandbox:' + path] = url;
    imports['sandbox:' + path.replace(/\\.js$/, '')] = url;
    imports['__sandbox__/' + path] = url;
    imports['__sandbox__/' + path.replace(/\\.js$/, '')] = url;
    imports['./' + path] = url;
    imports['./' + path.replace(/\\.js$/, '')] = url;
  }

  const importMapScript = document.createElement('script');
  importMapScript.type = 'importmap';
  importMapScript.textContent = JSON.stringify({ imports });
  document.head.appendChild(importMapScript);

  const entryPath = 'sandbox:${entryFile.replace(/\.tsx$/, '.js').replace(/\.ts$/, '.js').replace(/\.jsx$/, '.js')}';

  try {
    await import(entryPath);
  } catch (e) {
    console.error('Error ejecutando entry point:', e);
    const root = document.getElementById('root');
    if (root) root.innerHTML = '<div style="color:red;padding:20px;font-family:system-ui">Error: ' + (e && e.message ? e.message : e) + '</div>';
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
