import React, { useRef } from 'react';
import { Tag } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TagFilterBarProps {
  tags: Tag[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({ tags, selectedTag, onSelectTag }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (tags.length === 0) return null;

  return (
    <div className="relative flex items-center bg-transparent py-2">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 z-10 w-10 h-10 rounded-full bg-[var(--color-canvas)]/80 backdrop-blur-md shadow-sm border border-[var(--color-hairline)] flex items-center justify-center text-[var(--color-ink)] hover:bg-[var(--color-secondary-bg)] transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-2 px-12 py-1 scroll-smooth w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => onSelectTag(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-[14px] font-bold transition-colors ${
            selectedTag === null
              ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]'
              : 'bg-[var(--color-surface-card)] text-[var(--color-ink)] hover:bg-[var(--color-secondary-bg)]'
          }`}
        >
          All Pins
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onSelectTag(tag.name)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[14px] font-bold transition-colors ${
              selectedTag === tag.name
                ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]'
                : 'bg-[var(--color-surface-card)] text-[var(--color-ink)] hover:bg-[var(--color-secondary-bg)]'
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 z-10 w-10 h-10 rounded-full bg-[var(--color-canvas)]/80 backdrop-blur-md shadow-sm border border-[var(--color-hairline)] flex items-center justify-center text-[var(--color-ink)] hover:bg-[var(--color-secondary-bg)] transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
