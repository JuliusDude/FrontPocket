import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

interface UploadZoneProps {
  onUploadFiles: (files: File[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadFiles, isOpen, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const ext = file.type.split('/')[1] || 'png';
            const renamedFile = new File([file], `screenshot_${Date.now()}.${ext}`, { type: file.type });
            imageFiles.push(renamedFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        onUploadFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onUploadFiles]);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types.includes('Files')) setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent) => e.preventDefault();

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);

      if (e.dataTransfer?.files) {
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
        if (files.length > 0) onUploadFiles(files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onUploadFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
      if (files.length > 0) onUploadFiles(files);
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        multiple
        className="hidden"
      />

      {isDragging && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-[120px] h-[120px] rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white mb-6">
            <UploadCloud className="w-12 h-12" />
          </div>
          <h2 className="text-[28px] font-bold text-white mb-2">Drop to create Pin</h2>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="pinterest-modal max-w-[600px] w-full p-8 relative text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-ink)] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-[28px] font-bold text-[var(--color-ink)] mb-6">Create Pin</h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-[300px] bg-[var(--color-surface-card)] rounded-[16px] border-2 border-dashed border-[var(--color-hairline)] flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-secondary-bg)] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center mb-4">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-[16px] text-[var(--color-ink)] mb-2">Choose a file or drag and drop it here</p>
              <p className="text-[14px] text-[var(--color-mute)] mb-6">We recommend high-quality files less than 20MB</p>
              <button className="btn-secondary pointer-events-none">Choose file</button>
            </div>
            
            <p className="mt-6 text-[14px] text-[var(--color-mute)]">
              Pro tip: You can paste images from your clipboard anytime!
            </p>
          </div>
        </div>
      )}
    </>
  );
};
