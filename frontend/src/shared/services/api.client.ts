import { getAppJwt, setAppJwt, clearAppJwt } from './token.storage';
import { API_BASE_URL } from './api.config';

const BASE_URL = API_BASE_URL;

let msalTokenRefresher: (() => Promise<string | null>) | null = null;

export function setMsalTokenRefresher(
  refresher: () => Promise<string | null>
): void {
  msalTokenRefresher = refresher;
}

async function refreshAppJwtViaMsal(): Promise<boolean> {
  const refresher = msalTokenRefresher;
  const hasNoRefresher = refresher === null;
  if (hasNoRefresher) return false;

  let freshAzureAdToken: string | null = null;
  try {
    freshAzureAdToken = await refresher();
  } catch {
    clearAppJwt();
    return false;
  }
  const hasNoFreshToken = !freshAzureAdToken;
  if (hasNoFreshToken) return false;

  const response = await fetch(`${BASE_URL}/auth/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adToken: freshAzureAdToken }),
  });

  const isRefreshFailed = !response.ok;
  if (isRefreshFailed) {
    clearAppJwt();
    return false;
  }

  const tokenData = await response.json();
  setAppJwt(tokenData.accessToken);
  return true;
}

function buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = {
    ...customHeaders,
  };

  const currentToken = getAppJwt();
  const isAuthenticated = currentToken !== null;
  if (isAuthenticated) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  return headers;
}

async function retryOnUnauthorized(
  originalResponse: Response,
  retryFetch: () => Promise<Response>
): Promise<Response> {
  const isAuthorized = originalResponse.status !== 401;
  if (isAuthorized) return originalResponse;

  const isRefreshFailed = !(await refreshAppJwtViaMsal());
  if (isRefreshFailed) return originalResponse;

  return retryFetch();
}

function parseResponseBody<T>(response: Response, errorMessage: string): Promise<T> {
  const isNoContent = response.status === 204;
  if (isNoContent) return Promise.resolve(undefined as T);

  const isErrorResponse = !response.ok;
  if (isErrorResponse) {
    return response.json().catch(() => ({})).then((errorBody) => {
      throw new ApiError(response.status, errorBody.detail || errorMessage);
    });
  }

  return response.json();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  customHeaders?: Record<string, string>
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const jsonBody = body ? JSON.stringify(body) : undefined;

  const buildRequestHeaders = (): HeadersInit =>
    buildHeaders({ 'Content-Type': 'application/json', ...customHeaders });

  const initialResponse = await fetch(url, {
    method,
    headers: buildRequestHeaders(),
    body: jsonBody,
  });

  const response = await retryOnUnauthorized(initialResponse, () =>
    fetch(url, { method, headers: buildRequestHeaders(), body: jsonBody })
  );

  return parseResponseBody<T>(response, 'Request failed');
}

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export function get<T>(
  path: string,
  customHeaders?: Record<string, string>
): Promise<T> {
  return request<T>('GET', path, undefined, customHeaders);
}

export function post<T>(
  path: string,
  body?: unknown,
  customHeaders?: Record<string, string>
): Promise<T> {
  return request<T>('POST', path, body, customHeaders);
}

export function put<T>(
  path: string,
  body?: unknown,
  customHeaders?: Record<string, string>
): Promise<T> {
  return request<T>('PUT', path, body, customHeaders);
}

export function patch<T>(
  path: string,
  body?: unknown,
  customHeaders?: Record<string, string>
): Promise<T> {
  return request<T>('PATCH', path, body, customHeaders);
}

export function del<T>(
  path: string,
  customHeaders?: Record<string, string>
): Promise<T> {
  return request<T>('DELETE', path, undefined, customHeaders);
}

export async function upload<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const buildUploadHeaders = (): Record<string, string> => {
    const currentToken = getAppJwt();
    const hasNoToken = currentToken === null;
    if (hasNoToken) return {};
    return { Authorization: `Bearer ${currentToken}` };
  };

  const initialResponse = await fetch(url, {
    method: 'POST',
    headers: buildUploadHeaders(),
    body: formData,
  });

  const response = await retryOnUnauthorized(initialResponse, () =>
    fetch(url, { method: 'POST', headers: buildUploadHeaders(), body: formData })
  );

  return parseResponseBody<T>(response, 'Upload failed');
}
