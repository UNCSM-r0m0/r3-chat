import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { FileIcon } from './FileIcon';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FolderTreeProps {
  files: { path: string; language?: string }[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

function buildTree(files: { path: string }[]): FileNode[] {
  const root: FileNode[] = [];
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;
    
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');
      
      let existing = current.find(n => n.name === part);
      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          type: isLast ? 'file' : 'folder',
          children: isLast ? undefined : [],
        };
        current.push(existing);
        current.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'folder' ? -1 : 1;
        });
      }
      
      if (!isLast && existing.children) {
        current = existing.children;
      }
    });
  });
  
  return root;
}

const TreeNode: React.FC<{
  node: FileNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth: number;
}> = ({ node, selectedPath, onSelect, depth }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = node.path === selectedPath;
  
  const toggle = useCallback(() => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onSelect(node.path);
    }
  }, [node, isOpen, onSelect]);
  
  const paddingLeft = depth * 12 + 12;
  
  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className={`w-full flex items-center gap-1.5 py-1 pr-2 text-left text-sm transition-colors rounded-md mx-1 ${
          isSelected
            ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]'
        }`}
        style={{ paddingLeft }}
      >
        {node.type === 'folder' ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0 text-yellow-500/70" />
            ) : (
              <Folder className="w-4 h-4 flex-shrink-0 text-yellow-500/70" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <FileIcon filename={node.name} className="w-4 h-4 flex-shrink-0 opacity-70" />
          </>
        )}
        <span className="truncate text-xs">{node.name}</span>
      </button>
      
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({ files, selectedPath, onSelect }) => {
  const tree = buildTree(files);
  
  return (
    <div className="py-1">
      {tree.map(node => (
        <TreeNode
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  );
};

export default FolderTree;
