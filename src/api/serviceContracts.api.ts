import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

export interface ServiceContract {
  contract_id: string;
  asset_id: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  terms?: string;
  is_active: boolean;
  created_at: string;
}

export async function listServiceContracts(asset_id?: string): Promise<ServiceContract[]> {
  const { data } = await apiClient.get<ApiResponse<ServiceContract[]>>('/api/service-contracts', {
    params: asset_id ? { asset_id } : undefined,
  });
  return data.data;
}

export async function getServiceContract(contract_id: string): Promise<ServiceContract> {
  const { data } = await apiClient.get<ApiResponse<ServiceContract>>(`/api/service-contracts/${contract_id}`);
  return data.data;
}
