import type { Configuration, PopupRequest } from '@azure/msal-browser';
import { env } from '@/config/env';

export const msalConfig: Configuration = {
  auth: {
    clientId: env.VITE_AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${env.VITE_AZURE_AD_TENANT_ID}`,
    redirectUri: env.VITE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: [`api://${env.VITE_BACKEND_CLIENT_ID}/access_as_user`],
};
