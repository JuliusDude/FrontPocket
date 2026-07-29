import React from 'react';
import { Search, Plus, Moon, Sun, Wand2 } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenUpload: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onHome: () => void;
  onExplore: () => void;
  onAmazeMe: () => void;
  activeTab: 'home' | 'explore';
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenUpload,
  isDark,
  onToggleTheme,
  onHome,
  onExplore,
  onAmazeMe,
  activeTab,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-[64px] bg-[var(--color-canvas)] z-40 flex items-center px-4 gap-4 transition-colors">
      {/* Logo */}
      <a href="#" onClick={(e) => { e.preventDefault(); onHome(); }} className="flex-shrink-0 w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center transition-colors group">
        <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-[14px] shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          FP
        </div>
      </a>

      {/* Primary Links */}
      <div className="hidden md:flex items-center gap-1 font-semibold">
        <button onClick={onHome} className={`px-4 py-3 rounded-full text-[16px] cursor-pointer ${activeTab === 'home' ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]' : 'hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink)]'}`}>Home</button>
        <button onClick={onExplore} className={`px-4 py-3 rounded-full text-[16px] cursor-pointer ${activeTab === 'explore' ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]' : 'hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink)]'}`}>Explore</button>
        <button onClick={onOpenUpload} className="px-4 py-3 rounded-full hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink)] text-[16px] cursor-pointer">Create</button>
        <button onClick={onAmazeMe} className="px-4 py-3 rounded-full hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink)] text-[16px] cursor-pointer flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Amaze me
        </button>
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
          className="w-full h-[48px] bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] group-focus-within:bg-[var(--color-canvas)] group-focus-within:border group-focus-within:border-[var(--color-ash)] text-[var(--color-ink)] text-[16px] rounded-full pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-[var(--color-focus)]/20 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button onClick={onAmazeMe} className="md:hidden w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-ink)] transition-colors" title="Amaze me">
          <Wand2 className="w-6 h-6" />
        </button>
        <button onClick={onToggleTheme} className="w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-ink)] transition-colors" title="Toggle Theme">
          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
        <button onClick={onOpenUpload} className="w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-ink)] transition-colors" title="Create Pin">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};
