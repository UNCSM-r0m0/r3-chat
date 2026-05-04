import React from 'react';
import {
  FileCode,
  FileJson,
  FileType,
  Braces,
  Palette,
  FileText,
  Settings,
  Image,
  Code2,
} from 'lucide-react';

interface FileIconProps {
  filename: string;
  className?: string;
}

const getIconByExtension = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (ext) {
    case 'html':
    case 'htm':
      return FileType;
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return Palette;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return Code2;
    case 'json':
      return FileJson;
    case 'md':
    case 'markdown':
      return FileText;
    case 'xml':
    case 'svg':
      return Braces;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return Image;
    case 'config':
    case 'conf':
      return Settings;
    default:
      return FileCode;
  }
};

export const FileIcon: React.FC<FileIconProps> = ({ filename, className = 'w-4 h-4' }) => {
  const Icon = getIconByExtension(filename);
  return <Icon className={className} />;
};

export const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const langMap: Record<string, string> = {
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'json': 'json',
    'md': 'markdown',
    'markdown': 'markdown',
    'xml': 'xml',
    'svg': 'xml',
    'py': 'python',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'sql': 'sql',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sh': 'bash',
    'bash': 'bash',
  };
  
  return langMap[ext] || 'text';
};

export default FileIcon;
