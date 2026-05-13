import type { RequestExtension, CreateExtensionPayload } from '@/types/extension.types';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

export async function createExtension(payload: CreateExtensionPayload): Promise<RequestExtension> {
  const { data } = await apiClient.post<ApiResponse<RequestExtension>>('/api/extensions', payload);
  return data.data;
}

export async function listExtensions(parent_request_id: string): Promise<RequestExtension[]> {
  const { data } = await apiClient.get<ApiResponse<RequestExtension[]>>('/api/extensions', {
    params: { parent_request_id },
  });
  return data.data;
}

export async function approveExtension(extension_id: string): Promise<RequestExtension> {
  const { data } = await apiClient.post<ApiResponse<RequestExtension>>(`/api/extensions/${extension_id}/approve`);
  return data.data;
}

export async function rejectExtension(extension_id: string): Promise<RequestExtension> {
  const { data } = await apiClient.post<ApiResponse<RequestExtension>>(`/api/extensions/${extension_id}/reject`);
  return data.data;
}
