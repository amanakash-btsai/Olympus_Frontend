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

/** Deployment info embedded in a SalesRequestDetail response */
export interface SalesRequestDeployment {
  deployment_id: string;
  asset_id: string;
  status: string;
  start_date: string;
  expected_return_date: string;
  asset?: {
    asset_id: string;
    asset_name: string;
    serial_number: string;
    model_code: string;
    model_name?: string;
  };
}

/** SalesRequest enriched with joined relations — returned by the backend include */
export interface SalesRequestDetail extends SalesRequest {
  account?: { account_id: string; account_name: string };
  sales_person?: { user_id: string; name: string; email: string };
  approved_by?: { user_id: string; name: string } | null;
  deployments?: SalesRequestDeployment[];
}

export interface CreateSalesRequestPayload {
  record_type: SalesRequestRecordType;
  purpose1: SalesRequestPurpose1;
  purpose2: SalesRequestPurpose2;
  account_id: string;
  sales_person_id: string;
  /** ISO date string: date the goods are requested to be received */
  request_date: string;
  start_use_date: string;
  estimate_return_date: string;
  department_category?: string;
  department_name?: string;
  customer_address?: string;
  customer_pic_id?: string;
  event_name?: string;
  prospect_name?: string;
  pcl_number?: string;
  parent_request_id?: string;
  /** Asset UUIDs to attach to this request via DeviceDeployment */
  asset_ids?: string[];
}
