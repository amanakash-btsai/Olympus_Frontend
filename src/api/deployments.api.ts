import type { DeviceDeployment } from '@/types/deployment.types';
import type { DeploymentStatus, DeploymentType, ConditionOnDispatch, BillingCycle } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

interface DeploymentFilters {
  status?: DeploymentStatus;
  request_id?: string;
  asset_id?: string;
}

interface CreateDeploymentPayload {
  deployment_type: DeploymentType;
  start_date: string;
  expected_return_date: string;
  condition_on_dispatch?: ConditionOnDispatch;
  is_billable?: boolean;
  rental_rate_thb?: number;
  billing_cycle?: BillingCycle;
  responsible_eqc_id?: string;
}

export async function listDeployments(filters?: DeploymentFilters): Promise<DeviceDeployment[]> {
  const { data } = await apiClient.get<ApiResponse<DeviceDeployment[]>>('/api/deployments', { params: filters });
  return data.data;
}

export async function getDeployment(deployment_id: string): Promise<DeviceDeployment> {
  const { data } = await apiClient.get<ApiResponse<DeviceDeployment>>(`/api/deployments/${deployment_id}`);
  return data.data;
}

export async function createDeployment(
  request_id: string,
  asset_id: string,
  payload: CreateDeploymentPayload,
): Promise<DeviceDeployment> {
  const { data } = await apiClient.post<ApiResponse<DeviceDeployment>>('/api/deployments', {
    request_id,
    asset_id,
    ...payload,
  });
  return data.data;
}

export async function transitionDeploymentStatus(
  deployment_id: string,
  status: DeploymentStatus,
): Promise<DeviceDeployment> {
  const { data } = await apiClient.post<ApiResponse<DeviceDeployment>>(
    `/api/deployments/${deployment_id}/transition`,
    { status },
  );
  return data.data;
}
