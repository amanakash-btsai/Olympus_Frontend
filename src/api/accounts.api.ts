import type { Account } from '@/types/account.types';
import type { AreaCode } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

interface AccountFilters {
  area?: AreaCode;
  segmentation?: string;
  group_wave?: string;
}

type CreateAccountPayload = Omit<Account, 'account_id' | 'created_at'>;
type UpdateAccountPayload = Partial<CreateAccountPayload>;

export async function listAccounts(filters?: AccountFilters): Promise<Account[]> {
  const { data } = await apiClient.get<ApiResponse<Account[]>>('/api/accounts', { params: filters });
  return data.data;
}

export async function getAccount(account_id: string): Promise<Account> {
  const { data } = await apiClient.get<ApiResponse<Account>>(`/api/accounts/${account_id}`);
  return data.data;
}

export async function createAccount(payload: CreateAccountPayload): Promise<Account> {
  const { data } = await apiClient.post<ApiResponse<Account>>('/api/accounts', payload);
  return data.data;
}

export async function updateAccount(account_id: string, payload: UpdateAccountPayload): Promise<Account> {
  const { data } = await apiClient.patch<ApiResponse<Account>>(`/api/accounts/${account_id}`, payload);
  return data.data;
}
