import { setAppJwt } from './token.storage';
import { API_BASE_URL } from './api.config';

type TokenProvider = () => Promise<string | null>;

let registeredProvider: TokenProvider | null = null;
let activeRefreshPromise: Promise<boolean> | null = null;

export function registerTokenProvider(provider: TokenProvider): void {
  registeredProvider = provider;
}

export function refreshApplicationToken(): Promise<boolean> {
  if (activeRefreshPromise !== null) return activeRefreshPromise;

  activeRefreshPromise = executeTokenRefresh().finally(() => {
    activeRefreshPromise = null;
  });

  return activeRefreshPromise;
}

async function acquireTokenFromProvider(provider: TokenProvider): Promise<string | null> {
  try {
    return await provider();
  } catch {
    return null;
  }
}

async function executeTokenRefresh(): Promise<boolean> {
  const provider = registeredProvider;
  const hasNoProvider = provider === null;
  if (hasNoProvider) return false;

  const freshAzureAdToken = await acquireTokenFromProvider(provider);

  const hasNoFreshToken = freshAzureAdToken === null;
  if (hasNoFreshToken) return false;

  return exchangeTokenWithBackend(freshAzureAdToken);
}

async function exchangeTokenWithBackend(azureAdToken: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adToken: azureAdToken }),
  });

  const isExchangeFailed = !response.ok;
  if (isExchangeFailed) return false;

  const tokenData = await response.json();
  setAppJwt(tokenData.accessToken);
  return true;
}
