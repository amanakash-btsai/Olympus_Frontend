// ─────────────────────────────────────────────────────────────────────────────
// FILE: config/env.ts
// Frontend equivalent of the backend's config/index.ts.
//
// Reads Vite environment variables (from .env files, prefixed with VITE_)
// and validates them with Zod. If a required variable is missing, the app
// throws an error at startup instead of mysteriously failing later.
//
// VITE_ prefix is required by Vite — it only exposes variables with this
// prefix to the browser bundle (prevents accidentally leaking server-side secrets).
//
// `import.meta.env` is how Vite injects env variables into the browser code.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

const envSchema = z.object({
  VITE_AZURE_AD_CLIENT_ID: z.string().uuid(),    // The frontend app's Azure registration ID
  VITE_AZURE_AD_TENANT_ID: z.string().uuid(),    // Our Azure AD organisation (tenant)
  VITE_BACKEND_CLIENT_ID: z.string().uuid(),     // The backend API's Azure registration (for scope)
  VITE_REDIRECT_URI: z.string().url(),           // Where Azure redirects after login
  VITE_API_BASE_URL: z.string().url(),           // Backend API base URL (e.g. http://localhost:8000)
  VITE_APP_NAME: z.string().default('EQC Asset Management'),
  VITE_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
});

// Parse and validate at module load time — bad config fails fast.
export const env = envSchema.parse(import.meta.env);
