import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from './msal-config';
import {
  exchangeAzureTokenForAppJwt,
  fetchCurrentUserProfile,
  clearAuthSession,
} from './auth.service';
import { ApiError } from '../../shared/services/api.client';
import { API_BASE_URL } from '../../shared/services/api.config';
import { setMsalTokenRefresher } from '../../shared/services/api.client';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import type { AuthState } from '../../shared/models/AuthState';

function navigateAfterSignIn(navigate: NavigateFunction, isFirstLogin: boolean): void {
  const destinationPath = isFirstLogin ? '/settings' : '/';
  navigate(destinationPath, { replace: true });
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
} {
  const { instance, accounts, inProgress } = useMsal();
  const navigate = useNavigate();

  const {
    user,
    isLoading,
    authError,
    isAuthenticated,
    setUser,
    setIsLoading,
    setAuthError,
    setIsSessionInitialized,
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
    } catch {
      return null;
    }
  }, [instance, accounts]);

  useEffect(() => {
    setMsalTokenRefresher(acquireFreshAzureIdToken);
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
    try {
      const loginResult = await instance.loginPopup(loginRequest);
      const hasNoIdToken = !loginResult.idToken;
      if (hasNoIdToken) return;

      const callbackResponse = await exchangeAzureTokenForAppJwt(loginResult.idToken);
      const authenticatedUser = await fetchCurrentUserProfile();
      setUser(authenticatedUser);

      const authenticatedAccount = loginResult.account;
      const hasAuthenticatedAccount = authenticatedAccount !== null;
      if (hasAuthenticatedAccount) {
        instance.setActiveAccount(authenticatedAccount);
      }

      navigateAfterSignIn(navigate, callbackResponse.isFirstLogin);
    } catch (error) {
      setAuthError(buildAuthenticationErrorMessage(error));
    }
  }, [instance, navigate, setAuthError, setUser]);

  const signOut = useCallback(async (): Promise<void> => {
    clearAuthSession();
    clearAuthState();
    await instance.logoutPopup();
  }, [instance, clearAuthState]);

  return { user, isAuthenticated, isLoading, authError, signIn, signOut };
}
