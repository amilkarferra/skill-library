let appJwt: string | null = null;

export function getAppJwt(): string | null {
  return appJwt;
}

export function setAppJwt(token: string): void {
  appJwt = token;
}

export function clearAppJwt(): void {
  appJwt = null;
}
