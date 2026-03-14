import type { Configuration } from '@azure/msal-browser';
import { LogLevel, PublicClientApplication } from '@azure/msal-browser';

function validateRedirectUri(redirectUri: string): string {
  const redirectPathname = new URL(redirectUri).pathname;
  if (redirectPathname === '/' || redirectPathname === '') {
    throw new Error('VITE_AZURE_REDIRECT_URI must use a dedicated popup callback page.');
  }

  return redirectUri;
}

export const popupRedirectUri = validateRedirectUri(import.meta.env.VITE_AZURE_REDIRECT_URI);

const msalConfiguration: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: import.meta.env.VITE_AZURE_AUTHORITY,
    redirectUri: popupRedirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
    },
  },
};

export const msalInstance = new PublicClientApplication(msalConfiguration);

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};
