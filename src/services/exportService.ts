import JSZip from 'jszip';
import type { ArtifactFile } from '../stores/artifactStore';

/**
 * Exports a multi-file project as a ZIP file
 */
export async function exportProjectZip(
  files: ArtifactFile[],
  projectName: string = 'proyecto'
): Promise<void> {
  const zip = new JSZip();

  // Add all files to the zip
  for (const file of files) {
    zip.file(file.path, file.content);
  }

  // Generate README if it doesn't exist
  if (!files.some(f => f.path.toLowerCase() === 'readme.md')) {
    const readme = generateReadme(projectName, files);
    zip.file('README.md', readme);
  }

  // Generate package.json if it doesn't exist
  if (!files.some(f => f.path === 'package.json')) {
    const pkg = generatePackageJson(projectName, files);
    zip.file('package.json', pkg);
  }

  // Generate the zip blob
  const blob = await zip.generateAsync({ type: 'blob' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateReadme(projectName: string, files: ArtifactFile[]): string {
  const fileList = files.map(f => `- \`${f.path}\``).join('\n');

  return `# ${projectName}

Proyecto generado con Website Agent.

## Estructura

${fileList}

## Instalación

\`\`\`bash
npm install
\`\`\`

## Desarrollo

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`
`;
}

function generatePackageJson(projectName: string, files: ArtifactFile[]): string {
  const hasReact = files.some(f =>
    f.path.endsWith('.tsx') || f.path.endsWith('.jsx') || f.content.includes('react')
  );

  const hasTailwind = files.some(f =>
    f.path.endsWith('.css') && f.content.includes('tailwind')
  );

  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};

  if (hasReact) {
    dependencies.react = '^19.0.0';
    dependencies['react-dom'] = '^19.0.0';
    devDependencies['@types/react'] = '^19.0.0';
    devDependencies['@types/react-dom'] = '^19.0.0';
  }

  if (hasTailwind) {
    devDependencies.tailwindcss = '^4.0.0';
    devDependencies.postcss = '^8.0.0';
    devDependencies.autoprefixer = '^10.0.0';
  }

  // Check for other common deps
  for (const file of files) {
    if (file.content.includes('framer-motion')) {
      dependencies['framer-motion'] = '^11.0.0';
    }
    if (file.content.includes('lucide-react')) {
      dependencies['lucide-react'] = '^0.460.0';
    }
  }

  const pkg = {
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc -b && vite build',
      preview: 'vite preview',
    },
    dependencies,
    devDependencies: {
      ...devDependencies,
      '@vitejs/plugin-react': '^5.0.0',
      typescript: '^5.9.0',
      vite: '^7.0.0',
    },
  };

  return JSON.stringify(pkg, null, 2);
}

export default exportProjectZip;
