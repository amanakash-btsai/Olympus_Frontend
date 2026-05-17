// ─────────────────────────────────────────────────────────────────────────────
// FILE: hooks/useAuth.ts
// The primary hook used by the Login page to trigger login and logout.
//
// login()  — opens the Azure SSO popup, waits for the user to sign in, gets the
//            Azure token, exchanges it at our backend for a backend JWT, saves
//            the JWT, and populates the auth context with the user's profile.
//
// logout() — clears the backend token from memory/sessionStorage, clears the
//            user from context, then opens the Azure logout popup so Microsoft
//            also forgets the user's session.
// ─────────────────────────────────────────────────────────────────────────────

import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/authConfig';
import { getMe, exchangeToken } from '@/api/auth.api';
import { tokenStore } from '@/api/tokenStore';
import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const { instance } = useMsal();  // MSAL hook — gives us the Azure auth instance
  const { user, setUser, isLoading } = useAuthContext();

  // login: the full Azure SSO popup flow, step by step.
  async function login() {
    // Step 1: open the Microsoft login popup and wait for the user to sign in.
    const { accessToken: azureToken } = await instance.loginPopup(loginRequest);
    // Step 2: send the Azure token to our backend to get our own JWT.
    const backendToken = await exchangeToken(azureToken);
    // Step 3: save the backend JWT in sessionStorage for all future API calls.
    tokenStore.set(backendToken);
    // Step 4: fetch the user's profile from the backend and save it to context.
    const me = await getMe();
    setUser(me);
  }

  // logout: clear everything, then sign out of Microsoft too.
  async function logout() {
    tokenStore.clear();        // Remove JWT from sessionStorage
    setUser(null);             // Clear user from React context
    // Open Microsoft's logout popup — ends the Azure SSO session so
    // the user isn't auto-logged-back-in on next visit.
    await instance.logoutPopup({ postLogoutRedirectUri: window.location.origin });
  }

  return { user, isLoading, login, logout };
}
