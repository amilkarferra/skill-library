import { post, get } from '../../shared/services/api.client';
import { setAppJwt, clearAppJwt } from '../../shared/services/token.storage';
import type { AuthCallbackResponse } from '../../shared/models/AuthCallbackResponse';
import type { User } from '../../shared/models/User';

export async function exchangeAzureTokenForAppJwt(
  azureAdToken: string
): Promise<AuthCallbackResponse> {
  const callbackResponse = await post<AuthCallbackResponse>('/auth/callback', {
    adToken: azureAdToken,
  });
  setAppJwt(callbackResponse.accessToken);
  return callbackResponse;
}

export function fetchCurrentUserProfile(): Promise<User> {
  return get<User>('/me');
}

export function clearAuthSession(): void {
  clearAppJwt();
}
