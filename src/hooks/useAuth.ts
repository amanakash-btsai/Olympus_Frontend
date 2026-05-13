import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/authConfig';
import { getMe, exchangeToken } from '@/api/auth.api';
import { tokenStore } from '@/api/tokenStore';
import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const { instance } = useMsal();
  const { user, setUser, isLoading } = useAuthContext();

  async function login() {
    const { accessToken: azureToken } = await instance.loginPopup(loginRequest);
    const backendToken = await exchangeToken(azureToken);
    tokenStore.set(backendToken);
    const me = await getMe();
    setUser(me);
  }

  async function logout() {
    tokenStore.clear();
    setUser(null);
    await instance.logoutPopup({ postLogoutRedirectUri: window.location.origin });
  }

  return { user, isLoading, login, logout };
}
