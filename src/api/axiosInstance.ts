import axios from 'axios';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';
import { env } from '@/config/env';
import { loginRequest } from '@/authConfig';
import { msalInstance } from '@/lib/msalInstance';
import { tokenStore } from './tokenStore';

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach backend JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401: attempt silent Azure AD token re-acquire → re-exchange → retry once
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: ApiError }>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const { accessToken: azureToken } = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          const { data } = await axios.post<{ data: { accessToken: string } }>(
            `${env.VITE_API_BASE_URL}/api/auth/sso/exchange`,
            { azureAccessToken: azureToken },
          );
          tokenStore.set(data.data.accessToken);
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${data.data.accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch {
        tokenStore.clear();
      }
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (!error.response) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'A network error occurred',
      } as ApiError);
    }

    const apiError: ApiError = error.response.data?.error ?? {
      code: 'API_ERROR',
      message: error.message,
    };
    return Promise.reject(apiError);
  },
);
