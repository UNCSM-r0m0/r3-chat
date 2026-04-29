import React from 'react';
import { motion } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import type { UploadedFile } from '../../types';

interface AttachmentPreviewProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ file, onRemove }) => {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm"
    >
      <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="truncate text-[var(--text-secondary)]">{file.name}</p>
        <p className="text-xs text-[var(--text-muted)]">
          {file.contentType} · {formatSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className="p-1 rounded-md hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300 transition-colors"
        aria-label="Eliminar adjunto"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export default AttachmentPreview;
