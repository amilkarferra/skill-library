import { create } from 'zustand';
import type { DownloadUpdate } from '../models/DownloadUpdate';

interface DownloadStore {
  lastDownloadUpdate: DownloadUpdate | null;
  publishDownloadUpdate: (update: DownloadUpdate) => void;
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  lastDownloadUpdate: null,
  publishDownloadUpdate: (lastDownloadUpdate) => set({ lastDownloadUpdate }),
}));
