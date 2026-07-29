import React, { useState, useEffect } from 'react';
import { SettingsStatus } from '../types';
import { X } from 'lucide-react';

interface SettingsModalProps {
  settings: SettingsStatus | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave,
  onToast,
}) => {
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [anthropicKeyInput, setAnthropicKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setSelectedModel(settings.model || 'gemini-2.5-flash');
    }
  }, [settings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        geminiApiKey: geminiKeyInput,
        anthropicApiKey: anthropicKeyInput,
        model: selectedModel,
      });
      onToast('Settings saved successfully', 'success');
      setGeminiKeyInput('');
      setAnthropicKeyInput('');
      onClose();
    } catch (_) {
      onToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="pinterest-modal max-w-[600px] w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full hover:bg-[var(--color-secondary-bg)] flex items-center justify-center text-[var(--color-ink)] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-[28px] font-bold text-[var(--color-ink)] mb-2 text-center">Settings</h2>
        <p className="text-[16px] text-[var(--color-mute)] mb-8 text-center">Configure your AI vision providers</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[var(--color-ink)]">
              Google Gemini Studio API Key
              {settings?.hasGeminiKey && <span className="ml-2 text-[var(--color-mute)] font-normal">(Configured: {settings.geminiKeyMasked})</span>}
            </label>
            <input
              type="password"
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[var(--color-canvas)] text-[var(--color-ink)] border border-[var(--color-ash)] rounded-[16px] px-4 py-3 text-[16px] focus:outline-none focus:border-[var(--color-ink)] focus:ring-1 focus:ring-[var(--color-ink)] transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[var(--color-ink)]">
              Anthropic API Key (Optional)
              {settings?.hasAnthropicKey && <span className="ml-2 text-[var(--color-mute)] font-normal">(Configured: {settings.anthropicKeyMasked})</span>}
            </label>
            <input
              type="password"
              value={anthropicKeyInput}
              onChange={(e) => setAnthropicKeyInput(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full bg-[var(--color-canvas)] text-[var(--color-ink)] border border-[var(--color-ash)] rounded-[16px] px-4 py-3 text-[16px] focus:outline-none focus:border-[var(--color-ink)] focus:ring-1 focus:ring-[var(--color-ink)] transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[var(--color-ink)]">Preferred Vision Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-[var(--color-canvas)] text-[var(--color-ink)] border border-[var(--color-ash)] rounded-[16px] px-4 py-3 text-[16px] focus:outline-none focus:border-[var(--color-ink)] focus:ring-1 focus:ring-[var(--color-ink)] transition-all cursor-pointer"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div className="flex justify-center gap-3 pt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
