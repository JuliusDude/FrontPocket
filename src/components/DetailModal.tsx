import React, { useState, useEffect } from 'react';
import { Screenshot } from '../types';
import {
  Copy,
  Check,
  RefreshCw,
  Trash2,
  X,
  ExternalLink,
  Code,
  Loader2,
  AlertCircle,
  Tag as TagIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DetailModalProps {
  screenshot: Screenshot | null;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => Promise<void>;
  onRegenerate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  screenshot,
  onClose,
  onUpdate,
  onRegenerate,
  onDelete,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (screenshot) {
      setNotes(screenshot.notes ?? '');
      setTitle(screenshot.title ?? '');
      setShowConfirmDelete(false);
    }
  }, [screenshot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screenshot) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screenshot, onClose]);

  if (!screenshot) return null;

  const displayPrompt = screenshot.userEditedPrompt ?? screenshot.rebuildPrompt ?? 'No prompt generated yet.';
  const isAnalyzing = screenshot.status === 'analyzing';
  const isError = screenshot.status === 'error';

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(displayPrompt);
      setCopied(true);
      onToast('Rebuild prompt copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      onToast('Failed to copy prompt', 'error');
    }
  };

  const handleDownloadMarkdown = () => {
    try {
      const blob = new Blob([displayPrompt], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Default to "DESIGN.md" unless the user gave the pin a specific title
      const filename = screenshot.title ? `${screenshot.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_design.md` : 'DESIGN.md';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast('DESIGN.md downloaded successfully!', 'success');
    } catch (_) {
      onToast('Failed to download markdown', 'error');
    }
  };

  const handleSaveMeta = async () => {
    try {
      await onUpdate(screenshot.id, { notes, title });
    } catch (_) {}
  };

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate(screenshot.id);
      onToast('AI vision re-analysis triggered...', 'info');
    } catch (_) {
      onToast('Failed to trigger regeneration', 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete(screenshot.id);
      onClose();
      onToast('Pin deleted', 'info');
    } catch (_) {
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col pt-12 items-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="pinterest-modal w-full max-w-5xl my-auto flex flex-col overflow-hidden relative max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--color-canvas)] hover:bg-[var(--color-secondary-bg)] shadow-md flex items-center justify-center text-[var(--color-ink)] transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 h-full overflow-hidden">
          {/* Left: Image area */}
          <div className="bg-[var(--color-surface-card)] p-0 md:p-6 lg:p-8 flex items-start justify-center border-r border-[var(--color-hairline)] relative overflow-y-auto h-full">
            <motion.img
              src={screenshot.filePath}
              alt="Pin Reference"
              className="w-full h-auto md:rounded-[16px] shadow-sm"
            />
            <div className="absolute top-6 left-6 flex gap-2">
              <a
                href={screenshot.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--color-canvas)] hover:bg-[#f0f0f0] flex items-center justify-center text-[var(--color-ink)] shadow-md"
                title="Open image"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right: Info area */}
          <div className="p-8 lg:p-12 flex flex-col gap-8 bg-[var(--color-canvas)] overflow-y-auto h-full">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[22px] font-semibold text-[var(--color-ink)] mb-2">Rebuild Prompt</h2>
                <p className="text-[14px] text-[var(--color-mute)]">
                  Use this prompt with your AI coding agent to recreate this design.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadMarkdown}
                  className="btn-secondary whitespace-nowrap"
                  title="Download as DESIGN.md"
                >
                  Download .md
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyPrompt}
                  className="btn-primary"
                >
                  {copied ? 'Copied' : 'Copy'}
                </motion.button>
              </div>
            </div>

            {/* Prompt Display */}
            <div className="flex-1 bg-[var(--color-surface-card)] rounded-[16px] p-6 overflow-y-auto max-h-[400px]">
              {isAnalyzing ? (
                <div className="flex items-center gap-3 text-[var(--color-ink)]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-[16px] font-semibold">Analyzing image...</span>
                </div>
              ) : isError ? (
                <div className="text-[var(--color-error)] text-[14px] font-semibold flex items-start gap-2 overflow-y-auto">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <div className="flex-1 whitespace-pre-wrap">{screenshot.errorMessage || 'Vision AI Key Required'}</div>
                </div>
              ) : (
                <pre className="text-[14px] text-[var(--color-ink)] whitespace-pre-wrap font-mono leading-relaxed selection:bg-[var(--color-primary)] selection:text-white">
                  {displayPrompt}
                </pre>
              )}
            </div>

            {/* Meta & Actions */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[16px] font-semibold text-[var(--color-ink)]">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveMeta}
                  placeholder="Add a title to this pin..."
                  className="w-full bg-[var(--color-surface-card)] text-[var(--color-ink)] text-[16px] p-4 rounded-[16px] border-none focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[16px] font-semibold text-[var(--color-ink)]">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleSaveMeta}
                  placeholder="Add a note to this pin..."
                  className="w-full bg-[var(--color-surface-card)] text-[var(--color-ink)] text-[16px] p-4 rounded-[16px] border-none focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] resize-none transition-all"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[var(--color-hairline)]">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRegenerateClick}
                  disabled={isRegenerating || isAnalyzing}
                  className="btn-secondary"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </motion.button>

                {showConfirmDelete ? (
                  <div className="flex items-center gap-2">
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-[var(--color-error)] text-white text-[14px] font-bold rounded-[16px]"
                    >
                      Delete
                    </motion.button>
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowConfirmDelete(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowConfirmDelete(true)}
                    className="w-10 h-10 rounded-full hover:bg-[#ffebee] text-[var(--color-mute)] hover:text-[var(--color-error)] flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

