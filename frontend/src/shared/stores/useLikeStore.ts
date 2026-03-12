import { create } from 'zustand';
import type { LikeUpdate } from '../models/LikeUpdate';

interface LikeStore {
  lastLikeUpdate: LikeUpdate | null;
  publishLikeUpdate: (update: LikeUpdate) => void;
}

export const useLikeStore = create<LikeStore>((set) => ({
  lastLikeUpdate: null,
  publishLikeUpdate: (lastLikeUpdate) => set({ lastLikeUpdate }),
}));
