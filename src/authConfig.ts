// ─────────────────────────────────────────────────────────────────────────────
// FILE: authConfig.ts
// Configuration for MSAL (Microsoft Authentication Library) — the library that
// handles logging in via Azure Active Directory (Microsoft's identity platform).
//
// msalConfig: tells MSAL WHO we are (our app's client ID) and WHERE Azure
//             should send users after they log in (redirectUri).
//
// loginRequest: when we trigger a login popup, we request a specific OAuth
//               "scope" — permission to call our own backend API on the user's behalf.
//               The backend then verifies this token to confirm the user is real.
// ─────────────────────────────────────────────────────────────────────────────

import type { Configuration, PopupRequest } from '@azure/msal-browser';
import { env } from '@/config/env';

// msalConfig tells the MSAL library how to connect to our Azure AD tenant.
// clientId    = this frontend app's registration in Azure
// authority   = which Azure tenant (organisation) to authenticate against
// redirectUri = where Azure sends the user AFTER they log in (usually our app's URL)
// sessionStorage = tokens are stored per-tab, cleared on tab close (more secure than localStorage)
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

// loginRequest: the OAuth scopes we ask Azure for when the user logs in.
// "access_as_user" is a custom scope defined in our backend's Azure app registration.
// Azure will include this scope in the token, and our backend validates it.
export const loginRequest: PopupRequest = {
  scopes: [`api://${env.VITE_BACKEND_CLIENT_ID}/access_as_user`],
};
