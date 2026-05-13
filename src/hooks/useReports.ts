import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ReportType, ReportFilter, ScheduledReport } from '@/types/report.types';
import {
  getReportData,
  exportReport,
  scheduleReport,
  listScheduledReports,
  deleteScheduledReport,
} from '@/api/reports.api';

type CreateScheduledReportPayload = Omit<ScheduledReport, 'id' | 'created_at'>;

export function useReportData(type: ReportType, filters?: ReportFilter) {
  return useQuery({
    queryKey: ['reportData', type, filters],
    queryFn: () => getReportData(type, filters),
    enabled: !!type,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({
      type,
      filters,
      format,
    }: {
      type: ReportType;
      filters?: ReportFilter;
      format: 'xlsx' | 'csv' | 'pdf';
    }) => exportReport(type, filters, format),
    onSuccess: (blob, { type, format }) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${type}-report.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useScheduledReports() {
  return useQuery({
    queryKey: ['scheduledReports'],
    queryFn: listScheduledReports,
  });
}

export function useCreateScheduledReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateScheduledReportPayload) => scheduleReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
    },
  });
}

export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
    },
  });
}
