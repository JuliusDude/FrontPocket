import React from 'react';
import { Screenshot } from '../types';
import { ScreenshotCard } from './ScreenshotCard';
import { ImagePlus } from 'lucide-react';

interface GalleryGridProps {
  screenshots: Screenshot[];
  onSelectScreenshot: (screenshot: Screenshot) => void;
  isBulkMode: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onOpenUpload: () => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  screenshots,
  onSelectScreenshot,
  isBulkMode,
  selectedIds,
  onToggleSelect,
  onOpenUpload,
}) => {
  if (screenshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-card)] flex items-center justify-center mb-6">
          <ImagePlus className="w-8 h-8 text-[var(--color-mute)]" />
        </div>
        <h2 className="heading-xl text-[var(--color-ink)] mb-4">Nothing to show... yet! Pins you add will live here.</h2>
        <p className="text-[16px] text-[var(--color-mute)] mb-8">
          Upload some UI screenshots to start building your design taste reference board.
        </p>
        <button onClick={onOpenUpload} className="btn-primary">
          Create Pin
        </button>
      </div>
    );
  }

  return (
    <div className="masonry-grid w-full">
      {screenshots.map((s) => (
        <div key={s.id} className="masonry-item">
          <ScreenshotCard
            screenshot={s}
            onClick={onSelectScreenshot}
            isBulkMode={isBulkMode}
            isSelected={selectedIds.includes(s.id)}
            onToggleSelect={onToggleSelect}
          />
        </div>
      ))}
    </div>
  );
};
