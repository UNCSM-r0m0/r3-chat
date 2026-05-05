import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  FileCode,
  Eye,
  AlertCircle,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Download,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSandboxStore } from '../../stores/sandboxStore';
import { useArtifactStore } from '../../stores/artifactStore';
import { FileIcon, getLanguageFromFilename } from './FileIcon';
import { FolderTree } from './FolderTree';
import { bundleProject } from '../../services/bundler';
import { exportProjectZip } from '../../services/exportService';

type Tab = 'preview' | 'code';
type Device = 'desktop' | 'tablet' | 'mobile';

interface SandboxPanelProps {
  conversationId: string;
  artifactId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SandboxPanel: React.FC<SandboxPanelProps> = ({ conversationId, artifactId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [device, setDevice] = useState<Device>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFileTree, setShowFileTree] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bundledHtml, setBundledHtml] = useState<string | null>(null);
  const [bundleErrors, setBundleErrors] = useState<string[]>([]);
  const { previews } = useSandboxStore();
  const { currentArtifact, selectedFilePath, selectFile, loadArtifact, clearArtifact, isLoading, error } = useArtifactStore();
  const visiblePreviews = useMemo(() => previews[conversationId] || [], [previews, conversationId]);
  const lastPreviewArtifactId = useMemo(() => {
    const lastPreview = visiblePreviews[visiblePreviews.length - 1];
    if (!lastPreview) return null;

    const parts = lastPreview.id.split('-artifact-');
    return parts.length > 1 ? parts[1] : null;
  }, [visiblePreviews]);
  const effectiveArtifactId = artifactId ?? lastPreviewArtifactId;
  const activeArtifact =
    currentArtifact &&
    (currentArtifact.id === effectiveArtifactId || (!effectiveArtifactId && currentArtifact.conversation_id === conversationId))
      ? currentArtifact
      : null;

  // Load the artifact that belongs to the active chat/panel and prevent stale previews.
  useEffect(() => {
    if (!isOpen) return;

    if (effectiveArtifactId) {
      if (currentArtifact?.id !== effectiveArtifactId) {
        void loadArtifact(effectiveArtifactId);
      }
      return;
    }

    if (currentArtifact && currentArtifact.conversation_id !== conversationId) {
      clearArtifact();
    }
  }, [
    isOpen,
    effectiveArtifactId,
    currentArtifact?.id,
    currentArtifact?.conversation_id,
    conversationId,
    loadArtifact,
    clearArtifact,
  ]);

  const selectedFile = activeArtifact?.files.find((f) => f.path === selectedFilePath);

  // Bundle project when artifact changes
  useEffect(() => {
    if (activeArtifact && activeArtifact.files.length > 1) {
      const { html, errors } = bundleProject(activeArtifact.files);
      setBundledHtml(html);
      setBundleErrors(errors);
    } else {
      setBundledHtml(null);
      setBundleErrors([]);
    }
  }, [activeArtifact]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      void 0;
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    // Also re-bundle on refresh
    if (activeArtifact && activeArtifact.files.length > 1) {
      const { html, errors } = bundleProject(activeArtifact.files);
      setBundledHtml(html);
      setBundleErrors(errors);
    }
  }, [activeArtifact]);

  const deviceWidths: Record<Device, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-sm text-[var(--text-muted)] gap-3 px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-2">
        <FileCode className="w-8 h-8 opacity-40" />
      </div>
      <p className="text-base font-medium text-[var(--text-secondary)]">No hay proyecto cargado</p>
      <p className="text-xs opacity-60 max-w-[240px] text-center leading-relaxed">
        Generá un sitio web en modo Agéntico para ver el preview y el código
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full text-sm text-[var(--text-muted)] gap-3">
      <div className="relative">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
      <p>Cargando proyecto...</p>
      <p className="text-xs opacity-50">Esto puede tardar unos segundos</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full text-sm gap-3 px-6">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-red-300 font-medium">{error || 'Error cargando el proyecto'}</p>
      <button
        type="button"
        onClick={handleRefresh}
        className="mt-2 px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-xs transition-colors"
      >
        Reintentar
      </button>
    </div>
  );

  const renderFileTree = () => {
    if (!activeArtifact) return null;

    const files = activeArtifact.files;
    if (files.length === 0) return null;

    return (
      <div className={`border-r border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/30 overflow-y-auto flex-shrink-0 transition-all duration-200 ${
        showFileTree ? 'w-56' : 'w-0 overflow-hidden'
      }`}>
        <div className="px-3 py-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)] flex items-center justify-between">
          <span>Archivos</span>
          <span className="text-[10px] opacity-50">{files.length}</span>
        </div>
        <FolderTree
          files={files}
          selectedPath={selectedFilePath}
          onSelect={(path) => selectFile(path)}
        />
      </div>
    );
  };

  const renderPreview = () => {
    if (isLoading) return renderLoadingState();
    if (error) return renderErrorState();

    let content: string | null = null;
    let isMultiFile = false;

    if (activeArtifact) {
      // Check if it's a multi-file project
      if (activeArtifact.files.length > 1) {
        isMultiFile = true;
        content = bundledHtml;
      } else {
        // Single file
        const entryFile = activeArtifact.files.find((f) => f.path === activeArtifact.entry_file);
        if (entryFile) {
          content = entryFile.content;
        }
      }
    } else {
      const lastPreview = visiblePreviews[visiblePreviews.length - 1];
      if (lastPreview) {
        content = lastPreview.code;
      }
    }

    if (!content) return renderEmptyState();

    return (
      <div className="flex flex-col h-full bg-[var(--bg-tertiary)]/20">
        {/* Device Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-1">
            {(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                className={`p-2 rounded-lg transition-colors ${
                  device === d
                    ? 'bg-white/[0.08] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]'
                }`}
                title={d.charAt(0).toUpperCase() + d.slice(1)}
              >
                {d === 'desktop' && <Monitor className="w-4 h-4" />}
                {d === 'tablet' && <Tablet className="w-4 h-4" />}
                {d === 'mobile' && <Smartphone className="w-4 h-4" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {isMultiFile && bundleErrors.length > 0 && (
              <span className="text-xs text-yellow-500 mr-2">
                {bundleErrors.length} errores
              </span>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              title="Refrescar preview"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {activeArtifact && (
              <button
                type="button"
                onClick={() => exportProjectZip(activeArtifact.files, `proyecto-${activeArtifact.id.slice(0, 8)}`)}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                title="Descargar ZIP"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-4 flex justify-center">
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: deviceWidths[device],
              maxWidth: '100%',
              height: isFullscreen ? '100vh' : '100%',
              minHeight: '400px',
            }}
          >
            <iframe
              key={`${conversationId}-${activeArtifact?.id ?? 'legacy'}-${refreshKey}`}
              title="Artifact preview"
              sandbox="allow-scripts allow-forms allow-popups"
              srcDoc={content}
              className="w-full h-full"
              style={{ border: 'none', minHeight: '100%' }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCode = () => {
    if (isLoading) return renderLoadingState();
    if (error) return renderErrorState();
    if (!activeArtifact) return renderEmptyState();

    return (
      <div className="flex h-full">
        {renderFileTree()}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2">
                  <FileIcon filename={selectedFile.path} className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    {selectedFile.path}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-[var(--text-muted)] opacity-60">
                    {getLanguageFromFilename(selectedFile.path)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedFile.content)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    copied
                      ? 'bg-green-500/20 text-green-400'
                      : 'hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                  title="Copiar código"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <SyntaxHighlighter
                  language={getLanguageFromFilename(selectedFile.path)}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    background: 'transparent',
                    minHeight: '100%',
                  }}
                  showLineNumbers
                  lineNumberStyle={{
                    minWidth: '3em',
                    paddingRight: '1em',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '11px',
                  }}
                >
                  {selectedFile.content}
                </SyntaxHighlighter>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-sm text-[var(--text-muted)] gap-2">
              <FileCode className="w-8 h-8 opacity-20" />
              <p>Seleccioná un archivo del árbol</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasArtifact = activeArtifact != null || visiblePreviews.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 bottom-0 bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] z-50 flex flex-col shadow-2xl ${
              isFullscreen ? 'w-full' : 'w-full max-w-3xl'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFileTree(!showFileTree)}
                  className={`p-2 rounded-lg transition-colors md:hidden ${
                    showFileTree ? 'bg-white/[0.08] text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }`}
                  title="Mostrar/ocultar archivos"
                >
                  <ChevronLeft className={`w-4 h-4 transition-transform ${showFileTree ? 'rotate-180' : ''}`} />
                </button>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
                    <FileCode className="w-4 h-4 text-[var(--accent-primary)]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {activeArtifact ? `Proyecto ${activeArtifact.type}` || 'Proyecto Web' : 'Sandbox'}
                    </span>
                    {activeArtifact && (
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {activeArtifact.files.length} archivos
                      </span>
                    )}
                  </div>
                </div>

                {hasArtifact && (
                  <div className="hidden sm:flex items-center gap-1 ml-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeTab === 'preview'
                          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
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
                          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      Code
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                aria-label="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Tabs */}
            {hasArtifact && (
              <div className="flex sm:hidden border-b border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'code'
                      ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  Code
                </button>
              </div>
            )}

            {/* Content */}
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
