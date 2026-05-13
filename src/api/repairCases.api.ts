import type { RepairCase } from '@/types/repair.types';
import type { RepairCaseStatus, RepairType, AreaCode } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

interface RepairCaseFilters {
  status?: RepairCaseStatus;
  asset_id?: string;
  account_id?: string;
  area?: AreaCode;
  repair_type?: RepairType;
}

type UpdateRepairCasePayload = Partial<Omit<RepairCase, 'repair_id' | 'rs_number' | 'created_at'>>;

export async function listRepairCases(filters?: RepairCaseFilters): Promise<RepairCase[]> {
  const { data } = await apiClient.get<ApiResponse<RepairCase[]>>('/api/repair-cases', { params: filters });
  return data.data;
}

export async function getRepairCase(repair_id: string): Promise<RepairCase> {
  const { data } = await apiClient.get<ApiResponse<RepairCase>>(`/api/repair-cases/${repair_id}`);
  return data.data;
}

export async function updateRepairCase(repair_id: string, payload: UpdateRepairCasePayload): Promise<RepairCase> {
  const { data } = await apiClient.patch<ApiResponse<RepairCase>>(`/api/repair-cases/${repair_id}`, payload);
  return data.data;
}
