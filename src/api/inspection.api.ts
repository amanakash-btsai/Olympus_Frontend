import type { InspectionRecord } from '@/types/inspection.types';
import type { InspectionResult, OverallCondition } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

export async function createInspection(deployment_id: string): Promise<InspectionRecord> {
  const { data } = await apiClient.post<ApiResponse<InspectionRecord>>('/api/inspections', { deployment_id });
  return data.data;
}

export async function getInspection(inspection_id: string): Promise<InspectionRecord> {
  const { data } = await apiClient.get<ApiResponse<InspectionRecord>>(`/api/inspections/${inspection_id}`);
  return data.data;
}

export async function recordLineItemResult(
  inspection_id: string,
  line_id: string,
  result: InspectionResult,
  quantity_actual?: number,
  notes?: string,
): Promise<InspectionRecord> {
  const { data } = await apiClient.patch<ApiResponse<InspectionRecord>>(
    `/api/inspections/${inspection_id}/line-items/${line_id}`,
    { result, quantity_actual, notes },
  );
  return data.data;
}

export async function completeInspection(
  inspection_id: string,
  overall_condition: OverallCondition,
  notes?: string,
): Promise<InspectionRecord> {
  const { data } = await apiClient.post<ApiResponse<InspectionRecord>>(
    `/api/inspections/${inspection_id}/complete`,
    { overall_condition, notes },
  );
  return data.data;
}
