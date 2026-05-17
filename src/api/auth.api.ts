// ─────────────────────────────────────────────────────────────────────────────
// FILE: api/auth.api.ts
// API functions for authentication-related endpoints.
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';
import type { AuthUser } from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';
import { env } from '@/config/env';
import { apiClient } from './axiosInstance';

// getMe: call GET /api/auth/me to get the logged-in user's profile from the DB.
// The response normalises the field name: backend returns `user_id`, but our
// frontend AuthUser type uses `id` (shorter, consistent with React conventions).
export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser & { user_id?: string }>>('/api/auth/me');
  const raw = data.data;
  // Backend returns `user_id`; frontend AuthUser expects `id`.
  return { ...raw, id: raw.id ?? (raw as unknown as { user_id: string }).user_id };
}

// exchangeToken: send our Azure access token to the backend, get a backend JWT.
// Uses raw axios (NOT apiClient) because apiClient would try to add a backend
// JWT header — but we don't have one yet at this point in the login flow.
export async function exchangeToken(azureAccessToken: string): Promise<string> {
  const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
    `${env.VITE_API_BASE_URL}/api/auth/sso/exchange`,
    { azureAccessToken },
    { headers: { 'Content-Type': 'application/json' } },
  );
  return data.data.accessToken;
}
