// ─────────────────────────────────────────────────────────────────────────────
// FILE: api/assets.api.ts
// Functions that call the backend /api/assets endpoints.
// Each function wraps an axios call and returns just the data payload,
// hiding the { success, data } envelope from the rest of the app.
//
// Two list variants:
//   listAssets                — returns Asset[] (no deployment info)
//   listAssetsWithDeployments — returns AssetWithDeployments[] (includes current
//                               deployment windows, used by the calendar view)
// ─────────────────────────────────────────────────────────────────────────────

import type { Asset, AssetWithDeployments, CreateAssetPayload, UpdateAssetPayload } from '@/types/asset.types';
import type { AssetStatus, AssetDemoLoanerType } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

export interface AssetFilters {
  status?: AssetStatus;
  asset_name?: string;
  serial_number?: string;
  sap_asset_number?: string;
  installation_location?: string;
  model_code?: string;
  warehouse_code?: string;
  demo_loaner_type?: AssetDemoLoanerType;
  business_unit?: string;
  area?: string;
  is_active?: boolean;
  /** When true, each asset includes active DeviceDeployment windows for calendar rendering */
  include_deployments?: boolean;
}

export async function listAssets(filters?: Omit<AssetFilters, 'include_deployments'>): Promise<Asset[]> {
  const { data } = await apiClient.get<ApiResponse<Asset[]>>('/api/assets', { params: filters });
  return data.data;
}

export async function listAssetsWithDeployments(
  filters?: Omit<AssetFilters, 'include_deployments'>,
): Promise<AssetWithDeployments[]> {
  const { data } = await apiClient.get<ApiResponse<AssetWithDeployments[]>>('/api/assets', {
    params: { ...filters, include_deployments: true },
  });
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
