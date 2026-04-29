import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Trash2, Terminal } from 'lucide-react';
import { useSandboxStore } from '../../stores/sandboxStore';

interface SandboxPanelProps {
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SandboxPanel: React.FC<SandboxPanelProps> = ({ conversationId, isOpen, onClose }) => {
  const { results, isExecuting, clearExecutions } = useSandboxStore();
  const executions = results[conversationId] || [];

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      void 0;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay on mobile */}
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
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] z-50 flex flex-col"
          >
            {/** Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Sandbox</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => clearExecutions(conversationId)}
                  className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Limpiar resultados"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Cerrar panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/** Executions list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {executions.length === 0 && !isExecuting && (
                <div className="text-center text-sm text-[var(--text-muted)] py-8">
                  No hay ejecuciones aún.
                  <br />
                  Haz clic en "Ejecutar" en un bloque de código.
                </div>
              )}

              {isExecuting && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <div className="w-4 h-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                  Ejecutando...
                </div>
              )}

              {executions.map((exec) => (
                <motion.div
                  key={exec.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)]">
                    <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                      {exec.language}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(exec.output)}
                        className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Copiar salida"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {exec.error ? (
                    <div className="p-3">
                      <pre className="text-xs text-red-400 whitespace-pre-wrap break-words font-mono">{exec.error}</pre>
                    </div>
                  ) : (
                    <div className="p-3">
                      <pre className="text-xs text-[var(--code-text)] whitespace-pre-wrap break-words font-mono">{exec.output || '(sin salida)'}</pre>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SandboxPanel;
