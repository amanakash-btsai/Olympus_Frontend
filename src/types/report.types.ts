import type { SalesRequestPurpose1, SalesRequestPurpose2, AreaCode } from './enums';

export type ReportType =
  | 'SalesRequestSummary'
  | 'LoanerBilling'
  | 'InspectionDefects'
  | 'AssetUtilization'
  | 'OverdueAnalysis'
  | 'BOMCompliance'
  | 'RepairCaseSummary';

export interface ReportFilter {
  dateRange?: { start: string; end: string };
  status?: string[];
  account_id?: string;
  purpose1?: SalesRequestPurpose1[];
  purpose2?: SalesRequestPurpose2[];
  area?: AreaCode;
  [key: string]: unknown;
}

export interface ReportRow {
  [key: string]: string | number | boolean | null;
}

export interface ScheduledReport {
  id: string;
  report_type: ReportType;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  day?: string;
  time: string;
  recipients: string[];
  format: 'xlsx' | 'pdf' | 'csv';
  created_at: string;
}
