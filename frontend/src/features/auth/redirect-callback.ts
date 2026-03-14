import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge';

const hasAuthResponseParams = globalThis.location.hash.length > 1 || globalThis.location.search.length > 1;

if (hasAuthResponseParams) {
  await broadcastResponseToMainFrame();
} else {
  globalThis.close();
}
