import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (files: FileList) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (e.target.files && e.target.files.length > 0) {
        onFileSelect(e.target.files);
        e.target.value = ''; // reset
      }
    },
    [disabled, onFileSelect]
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={handleChange}
        disabled={disabled}
      />
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
      >
        <Upload className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">Adjuntar</span>
      </motion.button>
    </>
  );
};

export default FileUploader;
