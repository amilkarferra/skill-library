import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shared/styles/reset.css';
import './shared/styles/variables.css';
import './shared/styles/global.css';
import { App } from './App';
import { msalInstance } from './features/auth/msal-config';

await msalInstance.initialize();
await msalInstance.handleRedirectPromise();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
