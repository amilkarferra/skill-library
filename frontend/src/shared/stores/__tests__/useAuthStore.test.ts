import { useAuthStore } from '../useAuthStore';
import type { User } from '../../models/User';

function buildTestUser(): User {
  return {
    id: 1,
    username: 'test-user',
    displayName: 'Test User',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  };
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isLoading: true,
      authError: null,
      isAuthenticated: false,
      isSessionInitialized: false,
      isSessionExpired: false,
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const testUser = buildTestUser();
      useAuthStore.getState().setUser(testUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(testUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should clear user and mark as not authenticated when set to null', () => {
      const testUser = buildTestUser();
      useAuthStore.getState().setUser(testUser);
      useAuthStore.getState().setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setIsLoading', () => {
    it('should update loading state', () => {
      useAuthStore.getState().setIsLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setAuthError', () => {
    it('should set error message', () => {
      const errorMessage = 'Authentication failed';
      useAuthStore.getState().setAuthError(errorMessage);
      expect(useAuthStore.getState().authError).toBe(errorMessage);
    });

    it('should clear error when set to null', () => {
      useAuthStore.getState().setAuthError('some error');
      useAuthStore.getState().setAuthError(null);
      expect(useAuthStore.getState().authError).toBeNull();
    });
  });

  describe('setSessionExpired', () => {
    it('should set session expired flag', () => {
      useAuthStore.getState().setSessionExpired(true);
      expect(useAuthStore.getState().isSessionExpired).toBe(true);
    });
  });

  describe('clearAuthState', () => {
    it('should reset all auth state to defaults', () => {
      const testUser = buildTestUser();
      useAuthStore.getState().setUser(testUser);
      useAuthStore.getState().setIsSessionInitialized(true);
      useAuthStore.getState().setSessionExpired(true);

      useAuthStore.getState().clearAuthState();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isSessionInitialized).toBe(false);
      expect(state.isSessionExpired).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });
});
