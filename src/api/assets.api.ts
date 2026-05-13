import type { Asset, CreateAssetPayload, UpdateAssetPayload } from '@/types/asset.types';
import type { AssetStatus, AssetDemoLoanerType } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

interface AssetFilters {
  status?: AssetStatus;
  model_code?: string;
  warehouse_code?: string;
  demo_loaner_type?: AssetDemoLoanerType;
  business_unit?: string;
  area?: string;
  is_active?: boolean;
}

export async function listAssets(filters?: AssetFilters): Promise<Asset[]> {
  const { data } = await apiClient.get<ApiResponse<Asset[]>>('/api/assets', { params: filters });
  return data.data;
}

export async function getAsset(asset_id: string): Promise<Asset> {
  const { data } = await apiClient.get<ApiResponse<Asset>>(`/api/assets/${asset_id}`);
  return data.data;
}

export async function createAsset(payload: CreateAssetPayload): Promise<Asset> {
  const { data } = await apiClient.post<ApiResponse<Asset>>('/api/assets', payload);
  return data.data;
}

export async function updateAsset(asset_id: string, payload: UpdateAssetPayload): Promise<Asset> {
  const { data } = await apiClient.patch<ApiResponse<Asset>>(`/api/assets/${asset_id}`, payload);
  return data.data;
}

export async function transitionAssetStatus(asset_id: string, status: AssetStatus): Promise<Asset> {
  const { data } = await apiClient.post<ApiResponse<Asset>>(`/api/assets/${asset_id}/transition`, { status });
  return data.data;
}
