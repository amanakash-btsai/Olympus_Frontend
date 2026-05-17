// ─────────────────────────────────────────────────────────────────────────────
// FILE: api/salesRequests.api.ts
// Functions that call the backend /api/sales-requests endpoints.
// Covers the full request lifecycle: list, get, create, approve, reject,
// mark returned, and cancel.
//
// These functions are called by the useSalesRequests hook (not directly by
// components) — the hook adds caching, loading state, and cache invalidation.
// ─────────────────────────────────────────────────────────────────────────────

import type { SalesRequestDetail, CreateSalesRequestPayload } from '@/types/salesRequest.types';
import type { SalesRequestStatus, SalesRequestRecordType, SalesRequestPurpose1, SalesRequestPurpose2 } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

export interface SalesRequestFilters {
  status?: SalesRequestStatus;
  /** Comma-separated list of statuses, e.g. "Waiting_Reservation,Preparing" */
  statuses?: string;
  record_type?: SalesRequestRecordType;
  purpose1?: SalesRequestPurpose1;
  purpose2?: SalesRequestPurpose2;
  account_id?: string;
  sales_person_id?: string;
  date_range?: { start: string; end: string };
}

export async function listSalesRequests(filters?: SalesRequestFilters): Promise<SalesRequestDetail[]> {
  const { data } = await apiClient.get<ApiResponse<SalesRequestDetail[]>>('/api/sales-requests', { params: filters });
  return data.data;
}

export async function getSalesRequest(request_id: string): Promise<SalesRequestDetail> {
  const { data } = await apiClient.get<ApiResponse<SalesRequestDetail>>(`/api/sales-requests/${request_id}`);
  return data.data;
}

export async function createSalesRequest(payload: CreateSalesRequestPayload): Promise<SalesRequestDetail> {
  const { data } = await apiClient.post<ApiResponse<SalesRequestDetail>>('/api/sales-requests', payload);
  return data.data;
}

export async function approveSalesRequest(request_id: string): Promise<SalesRequestDetail> {
  const { data } = await apiClient.post<ApiResponse<SalesRequestDetail>>(`/api/sales-requests/${request_id}/approve`);
  return data.data;
}

export async function rejectSalesRequest(request_id: string, rejection_reason: string): Promise<SalesRequestDetail> {
  const { data } = await apiClient.post<ApiResponse<SalesRequestDetail>>(`/api/sales-requests/${request_id}/reject`, { rejection_reason });
  return data.data;
}

export async function markReturned(request_id: string): Promise<SalesRequestDetail> {
  const { data } = await apiClient.post<ApiResponse<SalesRequestDetail>>(`/api/sales-requests/${request_id}/return`);
  return data.data;
}

export async function cancelSalesRequest(request_id: string): Promise<SalesRequestDetail> {
  const { data } = await apiClient.post<ApiResponse<SalesRequestDetail>>(`/api/sales-requests/${request_id}/cancel`);
  return data.data;
}
