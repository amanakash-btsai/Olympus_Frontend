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
  const [isLoading, setIsLoading] = useState(true);

  // Runs once on mount to recover auth state from a page refresh.
  // The popup login case is handled entirely by useAuth.login().
  useEffect(() => {
    async function recover() {
      try {
        // Same-tab session: backend JWT still in sessionStorage
        const existingToken = tokenStore.get();
        if (existingToken) {
          const me = await getMe();
          setUser(me);
          return;
        }

        // Page refresh with MSAL session: silently get Azure token → exchange for backend JWT
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
        tokenStore.clear();
        setUser(null);
      } finally {
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

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
