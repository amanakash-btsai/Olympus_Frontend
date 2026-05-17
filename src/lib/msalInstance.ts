// ─────────────────────────────────────────────────────────────────────────────
// FILE: lib/msalInstance.ts
// Creates and exports the SINGLE shared MSAL (Azure login) instance.
//
// Why a singleton? MSAL maintains an internal session cache. If multiple
// instances were created, they'd each have their own cache and fight over
// the Azure session, causing duplicate login prompts and token confusion.
//
// This instance is used in THREE places:
//   - main.tsx          — for the popup guard (see comment there)
//   - api/axiosInstance — for silent token re-acquire on 401
//   - hooks/useAuth.ts  — for loginPopup() and logoutPopup()
// ─────────────────────────────────────────────────────────────────────────────

import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '@/authConfig';

// Single shared MSAL instance used by main.tsx, axiosInstance.ts, and anywhere
// else that needs to interact with MSAL outside of React context.
export const msalInstance = new PublicClientApplication(msalConfig);
