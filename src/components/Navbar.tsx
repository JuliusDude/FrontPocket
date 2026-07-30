import React from 'react';
import { Search, Plus, Moon, Sun, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <nav className="fixed top-0 left-0 right-0 h-[64px] bg-[var(--color-canvas)] border-b border-[var(--color-hairline)] z-40 flex items-center px-4 gap-4 transition-colors">
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex-shrink-0 flex items-center justify-center select-none pointer-events-none"
      >
        <img
          src={isDark ? '/logo_dark.png' : '/logo_light.png'}
          alt="FrontPocket Logo"
          className="w-10 h-10 object-contain rounded-lg"
        />
      </motion.div>

      {/* Primary Links */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="hidden md:flex items-center gap-1 font-semibold"
      >
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onHome} className={`px-4 py-3 rounded-full text-[16px] cursor-pointer ${activeTab === 'home' ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]' : 'hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink)]'}`}>Home</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onExplore} className={`px-4 py-3 rounded-full text-[16px] cursor-pointer ${activeTab === 'explore' ? 'bg-[var(--color-ink)] text-[var(--color-canvas)]' : 'hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink)]'}`}>Explore</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onOpenUpload} className="px-4 py-3 rounded-full hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink)] text-[16px] cursor-pointer">Create</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAmazeMe} className="px-4 py-3 rounded-full hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink)] text-[16px] cursor-pointer flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Amaze me
        </motion.button>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
        className="flex-1 max-w-[calc(100%-200px)] relative group"
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-[var(--color-mute)] transition-colors group-focus-within:text-[var(--color-primary)]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search for designs, tags..."
          className="w-full h-[48px] bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] group-focus-within:bg-[var(--color-canvas)] group-focus-within:border group-focus-within:border-[var(--color-primary)] text-[var(--color-ink)] text-[16px] rounded-full pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-300"
        />
      </motion.div>

      {/* Right Actions */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="flex items-center gap-2"
      >
        <motion.button whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }} onClick={onAmazeMe} className="md:hidden w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-ink)] transition-colors" title="Amaze me">
          <Wand2 className="w-6 h-6" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9, rotate: -15 }} onClick={onToggleTheme} className="w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-ink)] transition-colors" title="Toggle Theme">
          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </motion.button>
        <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9, rotate: 0 }} onClick={onOpenUpload} className="w-12 h-12 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-ink)] transition-colors" title="Create Pin">
          <Plus className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </nav>
  );
};
