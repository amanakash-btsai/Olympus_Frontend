// ─────────────────────────────────────────────────────────────────────────────
// FILE: api/axiosInstance.ts
// The single shared HTTP client used for ALL API calls to the backend.
//
// Two interceptors are set up:
//
//   REQUEST interceptor  — automatically attaches the backend JWT to every
//                          outgoing request's Authorization header.
//
//   RESPONSE interceptor — if a request gets a 401 (Unauthorized), this
//                          silently gets a fresh Azure token, exchanges it for
//                          a new backend JWT, updates the token store, and
//                          re-tries the original request ONCE. The user never
//                          sees the failure. If the retry also fails, the user
//                          is redirected to the login page.
//
// This is the "auto-refresh" mechanism — the access token expires every 15
// minutes, but the user never gets logged out unless they've been idle for 7 days.
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';
import { env } from '@/config/env';
import { loginRequest } from '@/authConfig';
import { msalInstance } from '@/lib/msalInstance';
import { tokenStore } from './tokenStore';

// Create an axios instance pre-configured with the backend base URL.
// withCredentials: true ensures the refresh token cookie is sent on every request.
export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// REQUEST interceptor: runs before every outgoing HTTP request.
// Reads the current backend JWT from sessionStorage and adds it as
// "Authorization: Bearer <token>" in the request headers.
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE interceptor: runs after every response (or error) comes back.
// On 401: attempt silent Azure AD token re-acquire → re-exchange → retry once.
// _retry flag prevents infinite loops (don't retry the retry).
apiClient.interceptors.response.use(
  (response) => response,  // Pass successful responses through unchanged
  async (error: AxiosError<{ error?: ApiError }>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;  // Mark so we don't retry this request again
      try {
        // Step 1: silently get a fresh Azure access token (no popup needed if MSAL
        //         has a valid session in its cache).
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const { accessToken: azureToken } = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          // Step 2: exchange the Azure token for a new backend JWT.
          const { data } = await axios.post<{ data: { accessToken: string } }>(
            `${env.VITE_API_BASE_URL}/api/auth/sso/exchange`,
            { azureAccessToken: azureToken },
          );
          // Step 3: store the new token and update the failing request's header.
          tokenStore.set(data.data.accessToken);
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${data.data.accessToken}`;
          }
          // Step 4: re-try the original request with the new token.
          return apiClient(originalRequest);
        }
      } catch {
        tokenStore.clear();
      }
      // If all recovery attempts fail, redirect to login.
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // No internet connection — wrap in a consistent error shape.
    if (!error.response) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'A network error occurred',
      } as ApiError);
    }

    // For all other errors, extract the API error from the response body
    // and reject with it so calling code gets a consistent error shape.
    const apiError: ApiError = error.response.data?.error ?? {
      code: 'API_ERROR',
      message: error.message,
    };
    return Promise.reject(apiError);
  },
);
