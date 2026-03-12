import { RouterProvider } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './features/auth/msal-config';
import { router } from './router';

export function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <RouterProvider router={router} />
    </MsalProvider>
  );
}
