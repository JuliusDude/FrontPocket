import React, { useState } from 'react';
import { Screenshot } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

interface ScreenshotCardProps {
  screenshot: Screenshot;
  onClick: (screenshot: Screenshot) => void;
  isBulkMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export const ScreenshotCard: React.FC<ScreenshotCardProps> = ({
  screenshot,
  onClick,
  isBulkMode,
  isSelected,
  onToggleSelect,
}) => {
  const isAnalyzing = screenshot.status === 'analyzing';
  const isError = screenshot.status === 'error';

  const handleCardClick = (e: React.MouseEvent) => {
    if (isBulkMode) {
      e.stopPropagation();
      onToggleSelect(screenshot.id);
    } else {
      onClick(screenshot);
    }
  };

  const handleQuickCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const promptText = screenshot.userEditedPrompt ?? screenshot.rebuildPrompt;
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
    } catch (_) {}
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-[16px] overflow-hidden bg-[var(--color-surface-card)] cursor-pointer mb-2 transform-gpu ${
        isSelected ? 'ring-4 ring-[var(--color-primary)] ring-offset-2' : ''
      }`}
    >
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={screenshot.filePath}
          alt="Pin Reference"
          loading="lazy"
          className={`w-full h-auto object-cover ${isAnalyzing ? 'opacity-50 blur-[2px]' : ''}`}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col justify-between p-4">
          <div className="flex justify-end pointer-events-auto">
             <button
               onClick={handleQuickCopyPrompt}
               className="btn-primary"
             >
               Copy Prompt
             </button>
          </div>
        </div>

        {/* Tag Pill Overlay */}
        {screenshot.tags && screenshot.tags.length > 0 && !isAnalyzing && (
          <div className="absolute bottom-4 left-4 pointer-events-none">
             <span className="bg-[var(--color-canvas)] text-[var(--color-ink)] font-bold text-[12px] px-3 py-1.5 rounded-full shadow-sm">
               {screenshot.tags[0].name.charAt(0).toUpperCase() + screenshot.tags[0].name.slice(1)} look
             </span>
          </div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-[var(--color-canvas)]/70 flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-2 bg-[var(--color-ink)] text-[var(--color-canvas)] px-4 py-2 rounded-full text-[14px] font-bold shadow-lg animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </div>
          </div>
        )}

        {isError && (
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-1.5 bg-[var(--color-error)] text-white px-3 py-1 rounded-full text-[12px] font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Analysis Failed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
