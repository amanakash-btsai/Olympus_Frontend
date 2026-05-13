import { z } from 'zod';

const envSchema = z.object({
  VITE_AZURE_AD_CLIENT_ID: z.string().uuid(),
  VITE_AZURE_AD_TENANT_ID: z.string().uuid(),
  VITE_BACKEND_CLIENT_ID: z.string().uuid(),
  VITE_REDIRECT_URI: z.string().url(),
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().default('EQC Asset Management'),
  VITE_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
});

export const env = envSchema.parse(import.meta.env);
