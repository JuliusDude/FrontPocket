import React, { useState, useEffect, useCallback } from 'react';
import { Screenshot, Tag, SettingsStatus, SortOption } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { UploadZone } from './components/UploadZone';
import { TagFilterBar } from './components/TagFilterBar';
import { GalleryGrid } from './components/GalleryGrid';
import { DetailModal } from './components/DetailModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<SettingsStatus | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Modals & Selection state
  const [activeScreenshot, setActiveScreenshot] = useState<Screenshot | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [screenshotData, tagData, settingsData] = await Promise.all([
        api.fetchScreenshots(selectedTag || undefined, searchQuery || undefined, sortOption),
        api.fetchTags(),
        api.fetchSettings(),
      ]);
      setScreenshots(screenshotData);
      setTags(tagData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed loading data:', err);
    }
  }, [selectedTag, searchQuery, sortOption]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const hasAnalyzing = screenshots.some((s) => s.status === 'analyzing');
    if (!hasAnalyzing) return;

    const interval = setInterval(async () => {
      try {
        const fresh = await api.fetchScreenshots(selectedTag || undefined, searchQuery || undefined, sortOption);
        setScreenshots(fresh);
        const freshTags = await api.fetchTags();
        setTags(freshTags);

        if (activeScreenshot) {
          const updatedActive = fresh.find((s) => s.id === activeScreenshot.id);
          if (updatedActive) setActiveScreenshot(updatedActive);
        }
      } catch (_) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [screenshots, selectedTag, searchQuery, sortOption, activeScreenshot]);

  const handleUploadFiles = async (files: File[]) => {
    setIsUploadOpen(false);
    addToast(`Uploading ${files.length} screenshot${files.length > 1 ? 's' : ''}...`, 'info');

    for (const file of files) {
      try {
        const created = await api.uploadScreenshot(file);
        setScreenshots((prev) => [created, ...prev]);
        addToast(`Uploaded "${file.name}". Analyzing taste...`, 'success');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        addToast(`Upload error: ${msg}`, 'error');
      }
    }

    try {
      const freshTags = await api.fetchTags();
      setTags(freshTags);
    } catch (_) {}
  };

  const handleUpdateScreenshot = async (
    id: string,
    updates: { userEditedPrompt?: string | null; notes?: string | null; rebuildPrompt?: string | null; tags?: string[] }
  ) => {
    const updated = await api.updateScreenshot(id, updates);
    setScreenshots((prev) => prev.map((s) => (s.id === id ? updated : s)));
    if (activeScreenshot?.id === id) setActiveScreenshot(updated);
    const freshTags = await api.fetchTags();
    setTags(freshTags);
  };

  const handleRegenerateScreenshot = async (id: string) => {
    const updated = await api.regenerateScreenshot(id);
    setScreenshots((prev) => prev.map((s) => (s.id === id ? updated : s)));
    if (activeScreenshot?.id === id) setActiveScreenshot(updated);
  };

  const handleDeleteScreenshot = async (id: string) => {
    await api.deleteScreenshot(id);
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
    if (activeScreenshot?.id === id) setActiveScreenshot(null);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    const freshTags = await api.fetchTags();
    setTags(freshTags);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSaveSettings = async (payload: { geminiApiKey?: string; anthropicApiKey?: string; apiKey?: string; model?: string }) => {
    const updated = await api.updateSettings(payload);
    setSettings(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-body)]">
      {/* Primary Nav */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Layout Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto">
        {settings && !settings.hasApiKey && (
          <div className="px-6 py-4 mb-4 mt-16 max-w-7xl mx-auto">
            <div className="p-4 rounded-[16px] bg-[var(--color-surface-card)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">✨</span>
                <div>
                  <p className="font-bold text-[var(--color-ink)] text-[16px]">AI Vision API Key Required</p>
                  <p className="text-[var(--color-mute)] text-[14px]">
                    Add your free Gemini API key to enable auto-tagging.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsSettingsOpen(true)} className="btn-primary">
                Add Key
              </button>
            </div>
          </div>
        )}

        {/* Filter bar acts as the secondary nav */}
        <div className="px-4 sm:px-6 mt-[64px] pb-4 sticky top-[64px] z-30 bg-white/90 backdrop-blur-md">
          <TagFilterBar
            tags={tags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        </div>

        {/* Pin Masonry Grid */}
        <div className="px-4 sm:px-6 pt-4 pb-16">
          <GalleryGrid
            screenshots={screenshots}
            onSelectScreenshot={setActiveScreenshot}
            isBulkMode={isBulkMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        </div>
      </main>

      <UploadZone
        onUploadFiles={handleUploadFiles}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <DetailModal
        screenshot={activeScreenshot}
        onClose={() => setActiveScreenshot(null)}
        onUpdate={handleUpdateScreenshot}
        onRegenerate={handleRegenerateScreenshot}
        onDelete={handleDeleteScreenshot}
        onToast={addToast}
      />

      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        onToast={addToast}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
