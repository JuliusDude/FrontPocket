import { Screenshot, Tag, SettingsStatus, SortOption } from '../types';

const API_BASE = '/api';

export const api = {
  async fetchScreenshots(tag?: string, search?: string, sort?: SortOption): Promise<Screenshot[]> {
    const params = new URLSearchParams();
    if (tag) params.append('tag', tag);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/screenshots${query}`);
    if (!res.ok) throw new Error('Failed to fetch screenshots');
    return res.json();
  },

  async fetchScreenshotDetail(id: string): Promise<Screenshot> {
    const res = await fetch(`${API_BASE}/screenshots/${id}`);
    if (!res.ok) throw new Error('Failed to fetch screenshot detail');
    return res.json();
  },

  async uploadScreenshot(file: File): Promise<Screenshot> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/screenshots`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Failed to upload image');
    }
    return res.json();
  },

  async updateScreenshot(
    id: string,
    data: { userEditedPrompt?: string | null; notes?: string | null; rebuildPrompt?: string | null; tags?: string[] }
  ): Promise<Screenshot> {
    const res = await fetch(`${API_BASE}/screenshots/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to update screenshot');
    return res.json();
  },

  async deleteScreenshot(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/screenshots/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete screenshot');
  },

  async bulkDeleteScreenshots(ids: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/screenshots/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Failed to bulk delete screenshots');
  },

  async regenerateScreenshot(id: string): Promise<Screenshot> {
    const res = await fetch(`${API_BASE}/screenshots/${id}/regenerate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to trigger AI regeneration');
    return res.json();
  },

  async fetchTags(): Promise<Tag[]> {
    const res = await fetch(`${API_BASE}/tags`);
    if (!res.ok) throw new Error('Failed to fetch tags');
    return res.json();
  },

  async fetchSettings(): Promise<SettingsStatus> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(payload: { geminiApiKey?: string; anthropicApiKey?: string; apiKey?: string; model?: string }): Promise<SettingsStatus> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },
};
