import type {
  SalesRequestRecordType,
  SalesRequestStatus,
  SalesRequestPurpose1,
  SalesRequestPurpose2,
} from './enums';

export interface SalesRequest {
  request_id: string;
  request_number: string;               // e.g., DR-2602-106504
  sfdc_request_id?: string;
  record_type: SalesRequestRecordType;
  status: SalesRequestStatus;
  purpose1: SalesRequestPurpose1;
  purpose2: SalesRequestPurpose2;
  account_id: string;
  department_category?: string;
  department_name?: string;
  customer_address?: string;
  customer_pic_id?: string;
  sales_person_id: string;
  request_date: string;
  start_use_date: string;
  estimate_return_date: string;
  actual_return_date?: string;
  repair_case_id?: string;
  parent_request_id?: string;           // For extension requests
  internal_so_number?: string;
  pr_number?: string;
  event_name?: string;
  prospect_name?: string;
  pcl_number?: string;
  total_loan_period_days?: number;      // Computed field
  extension_count: number;
  approved_by_id?: string;
  approved_at?: string;
  rejection_reason?: string;
  bom_set_id?: string;
  dispatch_doc_id?: string;
  inspection_record_id?: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSalesRequestPayload {
  record_type: SalesRequestRecordType;
  purpose1: SalesRequestPurpose1;
  purpose2: SalesRequestPurpose2;
  account_id: string;
  sales_person_id: string;
  start_use_date: string;
  estimate_return_date: string;
  department_category?: string;
  department_name?: string;
  customer_address?: string;
  event_name?: string;
  parent_request_id?: string;
}
