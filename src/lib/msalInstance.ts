import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '@/authConfig';

// Single shared MSAL instance used by main.tsx, axiosInstance.ts, and anywhere
// else that needs to interact with MSAL outside of React context.
export const msalInstance = new PublicClientApplication(msalConfig);
