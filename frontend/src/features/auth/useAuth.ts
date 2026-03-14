import { useCallback, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import {
  BrowserAuthError,
  InteractionRequiredAuthError,
  InteractionStatus,
} from '@azure/msal-browser';
import { loginRequest, popupRedirectUri } from './msal-config';
import {
  exchangeAzureTokenForAppJwt,
  fetchCurrentUserProfile,
  clearAuthSession,
} from './auth.service';
import { ApiError } from '../../shared/services/api.client';
import { API_BASE_URL } from '../../shared/services/api.config';
import { registerTokenProvider } from '../../shared/services/token.refresh';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import type { AuthState } from '../../shared/models/AuthState';

function isUserCancelledPopup(error: unknown): boolean {
  const isBrowserAuthError = error instanceof BrowserAuthError;
  if (!isBrowserAuthError) return false;

  const cancelledErrorCodes = ['user_cancelled', 'popup_window_error'];
  return cancelledErrorCodes.includes(error.errorCode);
}

function buildAuthenticationErrorMessage(error: unknown): string {
  const isApiError = error instanceof ApiError;
  if (isApiError) {
    return error.message;
  }

  const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
  if (isNetworkError) {
    return `Cannot reach the API at ${API_BASE_URL}. Start the backend and try again.`;
  }

  const isError = error instanceof Error;
  const hasErrorMessage = isError && error.message.length > 0;
  if (hasErrorMessage) {
    return error.message;
  }

  return 'Authentication failed. Please try again.';
}

export function useAuth(): AuthState & {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  reconnect: () => Promise<void>;
} {
  const { instance, accounts, inProgress } = useMsal();

  const {
    user,
    isLoading,
    authError,
    isAuthenticated,
    isSessionExpired,
    setUser,
    setIsLoading,
    setAuthError,
    setIsSessionInitialized,
    setSessionExpired,
    clearAuthState,
  } = useAuthStore();

  const acquireFreshAzureIdToken = useCallback(async (): Promise<string | null> => {
    const hasNoAccounts = accounts.length === 0;
    if (hasNoAccounts) return null;

    try {
      const silentResult = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return silentResult.idToken;
    } catch (silentError) {
      const isInteractionRequired = silentError instanceof InteractionRequiredAuthError;
      if (isInteractionRequired) {
        setSessionExpired(true);
      }
      return null;
    }
  }, [instance, accounts, setSessionExpired]);

  useEffect(() => {
    registerTokenProvider(acquireFreshAzureIdToken);
  }, [acquireFreshAzureIdToken]);

  useEffect(() => {
    const isMsalStillWorking = inProgress !== InteractionStatus.None;
    if (isMsalStillWorking) return;

    const { isSessionInitialized } = useAuthStore.getState();
    if (isSessionInitialized) return;

    setIsSessionInitialized(true);

    const hasNoActiveAccount = accounts.length === 0;
    if (hasNoActiveAccount) {
      setIsLoading(false);
      return;
    }

    const initializeSession = async (): Promise<void> => {
      const azureToken = await acquireFreshAzureIdToken();
      const hasNoAzureToken = !azureToken;
      if (hasNoAzureToken) {
        setIsLoading(false);
        return;
      }

      try {
        await exchangeAzureTokenForAppJwt(azureToken);
        const authenticatedUser = await fetchCurrentUserProfile();
        setUser(authenticatedUser);
      } catch (error) {
        setAuthError(buildAuthenticationErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [accounts, inProgress, acquireFreshAzureIdToken, setUser, setIsLoading, setAuthError, setIsSessionInitialized]);

  const signIn = useCallback(async (): Promise<void> => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const loginResult = await instance.loginPopup(loginRequest);
      const hasNoIdToken = !loginResult.idToken;
      if (hasNoIdToken) return;

      await exchangeAzureTokenForAppJwt(loginResult.idToken);
      const authenticatedUser = await fetchCurrentUserProfile();
      setUser(authenticatedUser);

      const authenticatedAccount = loginResult.account;
      const hasAuthenticatedAccount = authenticatedAccount !== null;
      if (hasAuthenticatedAccount) {
        instance.setActiveAccount(authenticatedAccount);
      }
    } catch (error) {
      const isPopupCancelled = isUserCancelledPopup(error);
      if (!isPopupCancelled) {
        setAuthError(buildAuthenticationErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  }, [instance, setAuthError, setIsLoading, setUser]);

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: popupRedirectUri,
        mainWindowRedirectUri: '/',
      });
      clearAuthSession();
      clearAuthState();
    } catch {
      setIsLoading(false);
    }
  }, [instance, clearAuthState, setIsLoading]);

  const reconnect = useCallback(async (): Promise<void> => {
    const hasNoAccounts = accounts.length === 0;
    if (hasNoAccounts) return;

    try {
      const popupResult = await instance.acquireTokenPopup({
        ...loginRequest,
        account: accounts[0],
      });
      const hasNoIdToken = !popupResult.idToken;
      if (hasNoIdToken) return;

      await exchangeAzureTokenForAppJwt(popupResult.idToken);
      setSessionExpired(false);
    } catch {
      setAuthError('Failed to reconnect. Please sign in again.');
    }
  }, [instance, accounts, setSessionExpired, setAuthError]);

  return { user, isAuthenticated, isLoading, authError, isSessionExpired, signIn, signOut, reconnect };
}
