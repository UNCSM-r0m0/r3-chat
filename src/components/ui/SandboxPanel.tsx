import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, FileCode, Eye, ChevronRight, ChevronDown } from 'lucide-react';
import { useSandboxStore } from '../../stores/sandboxStore';
import { useArtifactStore } from '../../stores/artifactStore';

type Tab = 'preview' | 'code';

interface SandboxPanelProps {
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SandboxPanel: React.FC<SandboxPanelProps> = ({ conversationId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const { results, previews, isExecuting, clearExecutions } = useSandboxStore();
  const { currentArtifact, selectedFilePath, selectFile, loadArtifact } = useArtifactStore();

  const executions = results[conversationId] || [];
  const previewItems = previews[conversationId] || [];
  const fallbackPreviews = previewItems.length === 0
    ? Object.values(previews).flat().filter((item) => item.conversationId.startsWith('pending-'))
    : [];
  const visiblePreviews = previewItems.length > 0 ? previewItems : fallbackPreviews;

  // Load artifact when available
  useEffect(() => {
    const lastPreview = visiblePreviews[visiblePreviews.length - 1];
    if (lastPreview && !currentArtifact) {
      // Try to extract artifact ID from preview id
      const parts = lastPreview.id.split('-artifact-');
      if (parts.length > 1) {
        void loadArtifact(parts[1]);
      }
    }
  }, [visiblePreviews, currentArtifact, loadArtifact]);

  const selectedFile = currentArtifact?.files.find((f) => f.path === selectedFilePath);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      void 0;
    }
  };

  const renderFileTree = () => {
    if (!currentArtifact) return null;

    const files = currentArtifact.files;
    const folders = new Map<string, typeof files>();

    files.forEach((file) => {
      const dir = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '';
      if (!folders.has(dir)) folders.set(dir, []);
      folders.get(dir)!.push(file);
    });

    return (
      <div className="w-48 border-r border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/30 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide border-b border-[var(--border-subtle)]">
          Archivos
        </div>
        {files.map((file) => (
          <button
            key={file.path}
            type="button"
            onClick={() => selectFile(file.path)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
              selectedFilePath === file.path
                ? 'bg-white/[0.08] text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{file.path}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderPreview = () => {
    if (currentArtifact) {
      const entryFile = currentArtifact.files.find((f) => f.path === currentArtifact.entry_file);
      if (entryFile) {
        return (
          <iframe
            title="Artifact preview"
            sandbox="allow-scripts"
            srcDoc={entryFile.content}
            className="w-full h-full bg-white"
          />
        );
      }
    }

    // Fallback to legacy previews
    const lastPreview = visiblePreviews[visiblePreviews.length - 1];
    if (lastPreview) {
      return (
        <iframe
          title="Sandbox preview"
          sandbox="allow-scripts"
          srcDoc={lastPreview.code}
          className="w-full h-full bg-white"
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-sm text-[var(--text-muted)]">
        No hay preview disponible
      </div>
    );
  };

  const renderCode = () => {
    if (!currentArtifact) {
      return (
        <div className="flex items-center justify-center h-full text-sm text-[var(--text-muted)]">
          No hay artifact cargado
        </div>
      );
    }

    return (
      <div className="flex h-full">
        {renderFileTree()}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedFile && (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/30">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  {selectedFile.path}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedFile.content)}
                  className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Copiar código"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <pre className="text-xs text-[var(--code-text)] whitespace-pre-wrap break-words font-mono leading-relaxed">
                  {selectedFile.content}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] z-50 flex flex-col"
          >
            {/** Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {currentArtifact ? 'Website' : 'Sandbox'}
                  </span>
                </div>
                {currentArtifact && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeTab === 'preview'
                          ? 'bg-white/[0.08] text-[var(--text-primary)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('code')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeTab === 'code'
                          ? 'bg-white/[0.08] text-[var(--text-primary)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      Code
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => clearExecutions(conversationId)}
                  className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Limpiar resultados"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Cerrar panel"
                >
                  㳎rrar />
                </button>
              </div>
            </div>

            {/** Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'preview' ? renderPreview() : renderCode()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SandboxPanel;
