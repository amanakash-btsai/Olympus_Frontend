import axios from 'axios';
import type { AuthUser } from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';
import { env } from '@/config/env';
import { apiClient } from './axiosInstance';

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser & { user_id?: string }>>('/api/auth/me');
  const raw = data.data;
  // Backend returns `user_id`; frontend AuthUser expects `id`.
  return { ...raw, id: raw.id ?? (raw as unknown as { user_id: string }).user_id };
}

// Uses raw axios (not apiClient) — no backend token exists yet at exchange time
export async function exchangeToken(azureAccessToken: string): Promise<string> {
  const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
    `${env.VITE_API_BASE_URL}/api/auth/sso/exchange`,
    { azureAccessToken },
    { headers: { 'Content-Type': 'application/json' } },
  );
  return data.data.accessToken;
}
