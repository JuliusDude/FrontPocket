export interface Tag {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export interface Screenshot {
  id: string;
  filePath: string;
  title?: string | null;
  uploadedAt: string;
  rebuildPrompt: string | null;
  userEditedPrompt: string | null;
  notes: string | null;
  status: 'analyzing' | 'completed' | 'error';
  errorMessage: string | null;
  tags: Tag[];
}

export type SortOption = 'newest' | 'oldest' | 'most_tags';
