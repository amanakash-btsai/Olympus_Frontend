import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { msalInstance } from '@/lib/msalInstance';
import App from '@/App';

// When MSAL's loginPopup completes, Azure redirects the popup window back to our
// redirectUri (localhost:3000). Without this guard, the full React app (and React
// Router) loads inside the popup — navigating to /login before MSAL can read the
// auth code from the URL, so the popup never closes.
//
// Fix: if we're inside a popup AND the URL contains an auth response (code= or
// error=), let MSAL's initialize() handle the redirect and skip rendering the app.
// MSAL will send the auth result to the parent window and the popup closes.
const isInsidePopup = window.opener !== null && window.opener !== window;
const hasAuthResponse =
  window.location.hash.includes('code=') ||
  window.location.search.includes('code=') ||
  window.location.hash.includes('error=') ||
  window.location.search.includes('error=');

if (isInsidePopup && hasAuthResponse) {
  // Popup redirect — let MSAL handle it; do NOT render the React app.
  await msalInstance.initialize();
} else {
  // Normal top-level window — render the full app.
  await msalInstance.initialize();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </MsalProvider>
    </StrictMode>,
  );
}
