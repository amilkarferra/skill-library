import { create } from 'zustand';
import type { User } from '../models/User';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  authError: string | null;
  isAuthenticated: boolean;
  isSessionInitialized: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setAuthError: (authError: string | null) => void;
  setIsSessionInitialized: (isInitialized: boolean) => void;
  clearAuthState: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  authError: null,
  isAuthenticated: false,
  isSessionInitialized: false,
  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setAuthError: (authError) => set({ authError }),
  setIsSessionInitialized: (isSessionInitialized) => set({ isSessionInitialized }),
  clearAuthState: () => set({ user: null, isAuthenticated: false, isSessionInitialized: false, isLoading: false }),
}));
