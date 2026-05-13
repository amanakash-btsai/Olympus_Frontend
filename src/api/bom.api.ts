import type { BOMSet, BOMLineItem, AccessoryMaster, PackingValidationResult } from '@/types/bom.types';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

interface CreateBOMSetPayload extends Omit<BOMSet, 'set_id' | 'created_at' | 'created_by_id'> {}
interface UpdateBOMSetPayload extends Partial<CreateBOMSetPayload> {}
interface CreateBOMLineItemPayload extends Omit<BOMLineItem, 'line_id' | 'set_id' | 'accessory'> {}
interface UpdateBOMLineItemPayload extends Partial<CreateBOMLineItemPayload> {}

interface AccessoryFilters {
  device_model_code?: string;
  is_active?: boolean;
}

export async function listBOMSets(model_code?: string): Promise<BOMSet[]> {
  const { data } = await apiClient.get<ApiResponse<BOMSet[]>>('/api/bom/sets', {
    params: model_code ? { model_code } : undefined,
  });
  return data.data;
}

export async function getBOMSet(set_id: string): Promise<BOMSet> {
  const { data } = await apiClient.get<ApiResponse<BOMSet>>(`/api/bom/sets/${set_id}`);
  return data.data;
}

export async function createBOMSet(payload: CreateBOMSetPayload): Promise<BOMSet> {
  const { data } = await apiClient.post<ApiResponse<BOMSet>>('/api/bom/sets', payload);
  return data.data;
}

export async function updateBOMSet(set_id: string, payload: UpdateBOMSetPayload): Promise<BOMSet> {
  const { data } = await apiClient.patch<ApiResponse<BOMSet>>(`/api/bom/sets/${set_id}`, payload);
  return data.data;
}

export async function getBOMLineItems(set_id: string): Promise<BOMLineItem[]> {
  const { data } = await apiClient.get<ApiResponse<BOMLineItem[]>>(`/api/bom/sets/${set_id}/line-items`);
  return data.data;
}

export async function createBOMLineItem(set_id: string, payload: CreateBOMLineItemPayload): Promise<BOMLineItem> {
  const { data } = await apiClient.post<ApiResponse<BOMLineItem>>(`/api/bom/sets/${set_id}/line-items`, payload);
  return data.data;
}

export async function updateBOMLineItem(line_id: string, payload: UpdateBOMLineItemPayload): Promise<BOMLineItem> {
  const { data } = await apiClient.patch<ApiResponse<BOMLineItem>>(`/api/bom/line-items/${line_id}`, payload);
  return data.data;
}

export async function listAccessoryMaster(filters?: AccessoryFilters): Promise<AccessoryMaster[]> {
  const { data } = await apiClient.get<ApiResponse<AccessoryMaster[]>>('/api/bom/accessories', { params: filters });
  return data.data;
}

export async function validatePacking(bom_set_id: string, packed_line_ids: string[]): Promise<PackingValidationResult> {
  const { data } = await apiClient.post<ApiResponse<PackingValidationResult>>('/api/bom/validate-packing', {
    bom_set_id,
    packed_line_ids,
  });
  return data.data;
}
