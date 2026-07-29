export interface Tag {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export interface Screenshot {
  id: string;
  filePath: string;
  uploadedAt: string;
  rebuildPrompt: string | null;
  userEditedPrompt: string | null;
  notes: string | null;
  status: 'analyzing' | 'completed' | 'error';
  errorMessage: string | null;
  tags: Tag[];
}

export interface SettingsStatus {
  hasApiKey: boolean;
  hasGeminiKey?: boolean;
  hasAnthropicKey?: boolean;
  geminiKeyMasked?: string;
  anthropicKeyMasked?: string;
  apiKeyMasked: string;
  model: string;
}

export type SortOption = 'newest' | 'oldest' | 'most_tags';
