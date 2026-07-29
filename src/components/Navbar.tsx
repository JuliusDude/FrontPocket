import React from 'react';
import { Search, Plus, Bell, MessageCircle, User } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenUpload,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-[64px] bg-[var(--color-canvas)] z-40 flex items-center px-4 gap-4">
      {/* Logo */}
      <a href="#" className="flex-shrink-0 w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center transition-colors">
        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
          P
        </div>
      </a>

      {/* Primary Links */}
      <div className="hidden md:flex items-center gap-1 font-semibold">
        <a href="#" className="px-4 py-3 rounded-full bg-[var(--color-ink)] text-white text-[16px]">Home</a>
        <a href="#" className="px-4 py-3 rounded-full hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink)] text-[16px]">Explore</a>
        <button onClick={onOpenUpload} className="px-4 py-3 rounded-full hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink)] text-[16px] cursor-pointer">Create</button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-[calc(100%-200px)] relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-[var(--color-mute)]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search for designs, tags..."
          className="w-full h-[48px] bg-[var(--color-surface-card)] hover:bg-[#e9e9e9] group-focus-within:bg-[var(--color-canvas)] group-focus-within:border group-focus-within:border-[var(--color-ash)] text-[var(--color-ink)] text-[16px] rounded-full pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-[var(--color-focus)]/20 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button onClick={onOpenUpload} className="w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-ink)] transition-colors" title="Create Pin">
          <Plus className="w-6 h-6" />
        </button>
        <button className="hidden sm:flex w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] items-center justify-center text-[var(--color-mute)] transition-colors">
          <Bell className="w-6 h-6" />
        </button>
        <button className="w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-mute)] transition-colors">
          <MessageCircle className="w-6 h-6" />
        </button>
        <button className="w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-mute)] transition-colors">
          <User className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};
