// ─────────────────────────────────────────────────────────────────────────────
// FILE: main.tsx
// The ENTRY POINT of the React frontend application. This is the first file
// that runs when the browser loads the app.
//
// It does two things:
//   1. Sets up Microsoft MSAL (Azure login library) so the app can authenticate
//   2. Wraps the React app in all the top-level "providers" (auth, data-fetching)
//
// The popup guard at the top is critical — without it, the Azure login popup
// would try to render the full React app inside itself and freeze.
// ─────────────────────────────────────────────────────────────────────────────

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

// CASE 1: We are inside the Azure login popup AND it's completing a login.
// Let MSAL process the auth code and close the popup — don't render React.
if (isInsidePopup && hasAuthResponse) {
  // Popup redirect — let MSAL handle it; do NOT render the React app.
  await msalInstance.initialize();
} else {
  // CASE 2: Normal top-level browser window — initialize MSAL and render the app.
  await msalInstance.initialize();

  // QueryClient: React Query's cache. staleTime: 5 minutes means once data is
  // fetched it won't be re-fetched from the server for 5 minutes (reduces API calls).
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
  });

  // Mount the React app inside the <div id="root"> in index.html.
  // Provider hierarchy (outer to inner):
  //   MsalProvider       — makes Azure auth available everywhere
  //   QueryClientProvider — makes React Query available everywhere
  //   App               — the actual application
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
