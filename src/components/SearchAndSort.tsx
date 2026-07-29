import React from 'react';
import { ArrowUpDown, Trash2, CheckSquare, Square } from 'lucide-react';
import { SortOption } from '../types';

interface SearchAndSortProps {
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  isBulkMode: boolean;
  selectedIds: string[];
  totalIds: string[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

export const SearchAndSort: React.FC<SearchAndSortProps> = ({
  sortOption,
  onSortChange,
  isBulkMode,
  selectedIds,
  totalIds,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
}) => {
  const allSelected = totalIds.length > 0 && selectedIds.length === totalIds.length;

  return (
    <div className="flex items-center justify-between gap-3 my-3 px-1">
      <div className="text-[14px] font-bold text-[var(--color-mute)]">
        {totalIds.length} {totalIds.length === 1 ? 'pin' : 'pins'}
      </div>

      <div className="flex items-center gap-2.5">
        {isBulkMode ? (
          <div className="flex items-center gap-3 bg-[var(--color-surface-card)] rounded-[16px] px-4 py-2">
            <button
              onClick={allSelected ? onClearSelection : onSelectAll}
              className="flex items-center gap-1.5 text-[14px] font-bold text-[var(--color-ink)] hover:text-[var(--color-mute)] transition-colors cursor-pointer"
            >
              {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
            </button>

            <span className="h-4 w-px bg-[var(--color-hairline)]" />

            <button
              onClick={onBulkDelete}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 text-[14px] font-bold text-[var(--color-error)] hover:text-[#cc001f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[var(--color-surface-card)] rounded-[16px] px-4 py-2 text-[14px] text-[var(--color-ink)] font-bold">
            <ArrowUpDown className="w-4 h-4 text-[var(--color-ink)]" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-[var(--color-ink)] font-bold focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[var(--color-surface-card)]">Newest</option>
              <option value="oldest" className="bg-[var(--color-surface-card)]">Oldest</option>
              <option value="most_tags" className="bg-[var(--color-surface-card)]">Most Tags</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
