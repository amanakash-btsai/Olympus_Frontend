import type { SalesRequest, CreateSalesRequestPayload } from '@/types/salesRequest.types';
import type { SalesRequestStatus, SalesRequestRecordType, SalesRequestPurpose1, SalesRequestPurpose2 } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

interface SalesRequestFilters {
  status?: SalesRequestStatus;
  record_type?: SalesRequestRecordType;
  purpose1?: SalesRequestPurpose1;
  purpose2?: SalesRequestPurpose2;
  account_id?: string;
  sales_person_id?: string;
  date_range?: { start: string; end: string };
}

export async function listSalesRequests(filters?: SalesRequestFilters): Promise<SalesRequest[]> {
  const { data } = await apiClient.get<ApiResponse<SalesRequest[]>>('/api/sales-requests', { params: filters });
  return data.data;
}

export async function getSalesRequest(request_id: string): Promise<SalesRequest> {
  const { data } = await apiClient.get<ApiResponse<SalesRequest>>(`/api/sales-requests/${request_id}`);
  return data.data;
}

export async function createSalesRequest(payload: CreateSalesRequestPayload): Promise<SalesRequest> {
  const { data } = await apiClient.post<ApiResponse<SalesRequest>>('/api/sales-requests', payload);
  return data.data;
}

export async function approveSalesRequest(request_id: string): Promise<SalesRequest> {
  const { data } = await apiClient.post<ApiResponse<SalesRequest>>(`/api/sales-requests/${request_id}/approve`);
  return data.data;
}

export async function rejectSalesRequest(request_id: string, rejection_reason: string): Promise<SalesRequest> {
  const { data } = await apiClient.post<ApiResponse<SalesRequest>>(`/api/sales-requests/${request_id}/reject`, { rejection_reason });
  return data.data;
}

export async function markReturned(request_id: string): Promise<SalesRequest> {
  const { data } = await apiClient.post<ApiResponse<SalesRequest>>(`/api/sales-requests/${request_id}/return`);
  return data.data;
}

export async function cancelSalesRequest(request_id: string): Promise<SalesRequest> {
  const { data } = await apiClient.post<ApiResponse<SalesRequest>>(`/api/sales-requests/${request_id}/cancel`);
  return data.data;
}
