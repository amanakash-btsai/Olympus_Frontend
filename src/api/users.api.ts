import type { User } from '@/types/user.types';
import type { UserRole } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

type CreateUserPayload = Omit<User, 'user_id'>;

export async function listUsers(): Promise<User[]> {
  const { data } = await apiClient.get<ApiResponse<User[]>>('/api/users');
  return data.data;
}

export async function getUser(user_id: string): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>(`/api/users/${user_id}`);
  return data.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await apiClient.post<ApiResponse<User>>('/api/users', payload);
  return data.data;
}

export async function updateUserRole(user_id: string, role: UserRole): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<User>>(`/api/users/${user_id}/role`, { role });
  return data.data;
}

export async function deactivateUser(user_id: string): Promise<User> {
  const { data } = await apiClient.post<ApiResponse<User>>(`/api/users/${user_id}/deactivate`);
  return data.data;
}
