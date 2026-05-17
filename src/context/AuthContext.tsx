// ─────────────────────────────────────────────────────────────────────────────
// FILE: context/AuthContext.tsx
// Manages the logged-in user's identity throughout the React app.
//
// Any component can call useAuthContext() to find out:
//   - user        — the logged-in user object (null if not logged in)
//   - isLoading   — true while we're still figuring out if the user is logged in
//   - setUser     — used by useAuth.login() and useAuth.logout()
//
// The AuthProvider also handles the "page refresh" problem:
//   When the user refreshes the browser, React's memory is wiped. This provider
//   runs on mount and tries to silently recover the session (either from
//   sessionStorage or from MSAL's cached Azure session).
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest } from '@/authConfig';
import { getMe, exchangeToken } from '@/api/auth.api';
import { tokenStore } from '@/api/tokenStore';
import { msalInstance } from '@/lib/msalInstance';
import type { AuthUser } from '@/types/auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // isLoading starts true so the ProtectedRoute shows a spinner instead of
  // flashing the login page while we're still checking the session.
  const [isLoading, setIsLoading] = useState(true);

  // Runs once on mount to recover auth state from a page refresh.
  // The popup login case is handled entirely by useAuth.login().
  useEffect(() => {
    async function recover() {
      try {
        // Recovery path 1: backend JWT is still in sessionStorage from this tab's session.
        // Just call /api/auth/me to confirm the token is still valid and get user data.
        const existingToken = tokenStore.get();
        if (existingToken) {
          const me = await getMe();
          setUser(me);
          return;
        }

        // Recovery path 2: no backend token, but MSAL remembers the user's Azure session.
        // acquireTokenSilent gets a fresh Azure token from the MSAL cache without any popup.
        // Then we exchange it at our backend for a new backend JWT.
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const { accessToken: azureToken } = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          const backendToken = await exchangeToken(azureToken);
          tokenStore.set(backendToken);
          const me = await getMe();
          setUser(me);
        }
      } catch {
        // Any failure (expired token, network error, etc.) — clear state and
        // let the user log in manually.
        tokenStore.clear();
        setUser(null);
      } finally {
        // Always clear the loading state, even on failure.
        setIsLoading(false);
      }
    }

    recover();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuthContext: the hook components use to access auth state.
// Throws if used outside <AuthProvider> — catches mistakes early.
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
