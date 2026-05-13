import type { ReportType, ReportFilter, ReportRow, ScheduledReport } from '@/types/report.types';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from './axiosInstance';

type CreateScheduledReportPayload = Omit<ScheduledReport, 'id' | 'created_at'>;

export async function getReportData(type: ReportType, filters?: ReportFilter): Promise<ReportRow[]> {
  const { data } = await apiClient.get<ApiResponse<ReportRow[]>>(`/api/reports/${type}`, { params: filters });
  return data.data;
}

export async function exportReport(
  type: ReportType,
  filters: ReportFilter | undefined,
  format: 'xlsx' | 'csv' | 'pdf',
): Promise<Blob> {
  const response = await apiClient.get(`/api/reports/${type}/export`, {
    params: { ...filters, format },
    responseType: 'blob',
  });
  return response.data as Blob;
}

export async function scheduleReport(payload: CreateScheduledReportPayload): Promise<ScheduledReport> {
  const { data } = await apiClient.post<ApiResponse<ScheduledReport>>('/api/reports/schedules', payload);
  return data.data;
}

export async function listScheduledReports(): Promise<ScheduledReport[]> {
  const { data } = await apiClient.get<ApiResponse<ScheduledReport[]>>('/api/reports/schedules');
  return data.data;
}

export async function deleteScheduledReport(id: string): Promise<void> {
  await apiClient.delete(`/api/reports/schedules/${id}`);
}
