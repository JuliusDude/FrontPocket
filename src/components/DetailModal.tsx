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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (screenshot) {
      setNotes(screenshot.notes ?? '');
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

  const handleSaveNotes = async () => {
    try {
      await onUpdate(screenshot.id, { notes });
      onToast('Notes updated', 'success');
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col pt-12 items-center p-4 overflow-y-auto"
    >
      <div
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
            <img
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
                  onClick={handleCopyPrompt}
                  className="btn-primary"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
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
                <label className="text-[16px] font-semibold text-[var(--color-ink)]">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleSaveNotes}
                  placeholder="Add a note to this pin..."
                  className="w-full bg-[var(--color-surface-card)] text-[var(--color-ink)] text-[16px] p-4 rounded-[16px] border-none focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] resize-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[var(--color-hairline)]">
                <button
                  onClick={handleRegenerateClick}
                  disabled={isRegenerating || isAnalyzing}
                  className="btn-secondary"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>

                {showConfirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-[var(--color-error)] text-white text-[14px] font-bold rounded-[16px]"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="w-10 h-10 rounded-full hover:bg-[#ffebee] text-[var(--color-mute)] hover:text-[var(--color-error)] flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
