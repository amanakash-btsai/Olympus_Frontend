# TypeScript Types (`src/types/`)

All types are union types (not TypeScript `enum`) to allow direct comparison with API string values without transformation. These files must be created first — they are imported by every feature hook and component.

---

## `src/types/enums.ts`

All application string-literal union types mirroring the backend schema:

```typescript
// User roles — maps to users.role in DB
export type UserRole =
  | 'Sales_Rep'
  | 'FSE'
  | 'EQC_Operator'
  | 'EQC_Manager'
  | 'Sales_Manager'
  | 'Executive'
  | 'System_Admin'
  | 'Integration_Service';

// Asset status — full lifecycle as per assets.status
export type AssetStatus =
  | 'Available'
  | 'Requested'
  | 'Preparing'
  | 'BOM_Confirmed'
  | 'Dispatched'
  | 'In_Transit'
  | 'With_Customer'
  | 'Return_Initiated'
  | 'In_Inspection'
  | 'Cleaning'
  | 'Under_Repair'
  | 'Quarantine'
  | 'Extension_Used'
  | 'Overdue'
  | 'Retired';

// Asset category type
export type AssetDemoLoanerType =
  | 'Demo_Asset'
  | 'Loaner_Asset'
  | 'MBA_Asset'
  | 'Service_Center'
  | 'Rental'
  | 'Operating_Lease'
  | 'Workshop'
  | 'MKTS'
  | 'Comprehensive_Contract';

export type AssetConditionGrade = 'New' | 'Good' | 'Needs_Service' | 'Defective';
export type AssetAgeGroup = 'Young' | 'Mature' | 'Old';
export type FDAStatus = 'Not_Enrolled' | 'Enrolled' | 'Approved';
export type AnnualInspectionStatus = '1_Target' | '2_Scheduled' | '3_Completed' | '4_Not_Target';

// Sales Request status — full operational lifecycle
export type SalesRequestStatus =
  | 'Draft'
  | 'Waiting_Approval'
  | 'Waiting_Reservation'
  | 'Preparing'
  | 'BOM_Confirmed'
  | 'Ready_for_Dispatch'
  | 'Dispatched'
  | 'With_Customer'
  | 'Return_Initiated'
  | 'Request_Complete'
  | 'Cancelled';

export type SalesRequestRecordType = 'First_Request' | 'Extension_Request';
export type SalesRequestPurpose1 = 'Repair' | 'Sales' | 'Marketing' | 'QARA' | 'Others';
export type SalesRequestPurpose2 =
  | 'Normal_Repair_Loaner'
  | 'Q3S_Loaner'
  | 'GI3_Loaner'
  | 'Service_Contract_Loaner'
  | 'Demonstration'
  | 'VPP_CPP_Rental'
  | 'Operating_Lease'
  | 'Workshop';

// Request Extension status
export type ExtensionStatus = 'Waiting_Approval' | 'Approved' | 'Rejected';

// Device Deployment status
export type DeploymentStatus =
  | 'Preparing'
  | 'Dispatched'
  | 'With_Customer'
  | 'Returned'
  | 'In_Inspection'
  | 'In_Repair';

export type DeploymentType = 'Demo' | 'Loaner' | 'Rental' | 'Operating_Lease';
export type ConditionOnDispatch = 'New' | 'Good' | 'Needs_Service';
export type ConditionOnReturn = 'Good' | 'Needs_Cleaning' | 'Defective' | 'Missing';
export type BillingCycle = 'Daily' | 'Weekly' | 'Monthly';

// Dispatch Document
export type DispatchDocumentType = 'First_Request' | 'Extension' | 'Item_List' | 'Return_Receipt';
export type DispatchDocStatus = 'Generated' | 'Sent_to_Print' | 'Signed' | 'Uploaded' | 'Archived';

// Inspection
export type InspectionResult = 'Pass' | 'Fail' | 'Missing';
export type InspectionType = 'DISPATCH' | 'RETURN';
export type OverallCondition = 'Good' | 'Needs_Cleaning' | 'Defective' | 'Missing';

// Repair Case
export type RepairCaseStatus =
  | 'Quoted'
  | 'IQ_Quoted'
  | 'PO_Received'
  | 'Parts_Arranged'
  | 'Confirmed'
  | 'Completed';
export type RepairType = 'Normal_Repair' | 'Q3S_Repair' | 'GI_Repair' | 'Service_Contract';
export type AreaCode = 'CENTRAL' | 'EAST' | 'NORTH' | 'SOUTH' | 'LAOS';

// Event Log
export type EventEntityType =
  | 'asset'
  | 'sales_request'
  | 'deployment'
  | 'dispatch_doc'
  | 'inspection'
  | 'repair_case'
  | 'bom_set';
export type EventType =
  | 'STATUS_CHANGE'
  | 'FIELD_UPDATE'
  | 'APPROVAL'
  | 'EXTENSION'
  | 'DISPATCH'
  | 'RETURN';
export type ActorType = 'User' | 'System' | 'AI_Agent' | 'Integration';

// Teams Alert Log
export type AlertDeliveryStatus = 'Sent' | 'Delivered' | 'Failed' | 'Retry';

// AI Prediction
export type AIPredictionType =
  | 'OVERDUE_FORECAST'
  | 'ANOMALY_DETECTION'
  | 'AUDIT_NARRATION';
```

---

## `src/types/auth.types.ts`

```typescript
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sfdc_user_id?: string;
}
```

---

## `src/types/api.types.ts`

```typescript
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
```

---

## `src/types/asset.types.ts`

```typescript
export interface Asset {
  asset_id: string;
  asset_name: string;
  serial_number: string;
  model_code: string;
  model_name?: string;
  sap_asset_number?: string;
  sfdc_asset_id?: string;
  status: AssetStatus;
  demo_loaner_type: AssetDemoLoanerType;
  warehouse_code?: string;
  installation_location?: string;
  account_id?: string;
  fse_owner_id?: string;
  business_unit?: string;
  oth_tier1?: string;
  oth_tier2?: string;
  oth_tier3?: string;
  install_date?: string;
  warranty_start?: string;
  warranty_end?: string;
  invoice_date?: string;
  asset_age_group?: AssetAgeGroup;
  fda_status?: FDAStatus;
  fda_approved_no?: string;
  service_contract_id?: string;
  total_repair_count?: number;
  total_repair_amount_thb?: number;
  last_pm_date?: string;
  annual_inspection_status?: AnnualInspectionStatus;
  condition_grade?: AssetConditionGrade;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetPayload extends Omit<Asset, 'asset_id' | 'created_at' | 'updated_at'> {}
export interface UpdateAssetPayload extends Partial<CreateAssetPayload> {}
```

---

## `src/types/salesRequest.types.ts`

```typescript
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
```

---

## `src/types/extension.types.ts`

```typescript
export interface RequestExtension {
  extension_id: string;
  parent_request_id: string;
  new_return_date: string;
  reason_code: string;
  reason_text?: string;
  status: ExtensionStatus;
  approved_by_id?: string;
  created_at: string;
}

export interface CreateExtensionPayload {
  parent_request_id: string;
  new_return_date: string;
  reason_code: string;
  reason_text?: string;
}
```

---

## `src/types/bom.types.ts`

```typescript
export interface BOMSet {
  set_id: string;
  set_name: string;                     // e.g., Set A, Set B, Set C, Set D
  model_code: string;
  version: string;
  effective_date: string;
  expiry_date?: string;
  is_active: boolean;
  description?: string;
  created_by_id: string;
  created_at: string;
}

export interface BOMLineItem {
  line_id: string;
  set_id: string;
  accessory_id: string;
  sequence_no?: number;
  quantity_required: number;
  is_required: boolean;                 // true = dispatch blocked if missing
  is_optional: boolean;
  is_consumable: boolean;
  storage_location?: string;
  accessory?: AccessoryMaster;          // Populated via join
}

export interface AccessoryMaster {
  accessory_id: string;
  accessory_code: string;               // e.g., MAJ-1435
  accessory_name: string;               // e.g., Water Supply Tube
  device_model_code?: string;
  is_active: boolean;
  created_at: string;
}

export interface PackingValidationResult {
  isComplete: boolean;
  missingItems: Array<{
    line_id: string;
    accessory_name: string;
    quantity_required: number;
  }>;
}
```

---

## `src/types/deployment.types.ts`

```typescript
export interface DeviceDeployment {
  deployment_id: string;
  request_id: string;
  asset_id: string;
  deployment_type: DeploymentType;
  status: DeploymentStatus;
  start_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  days_outstanding?: number;            // Computed: TODAY - expected_return_date
  condition_on_dispatch?: ConditionOnDispatch;
  condition_on_return?: ConditionOnReturn;
  is_billable?: boolean;
  rental_rate_thb?: number;
  billing_cycle?: BillingCycle;
  responsible_eqc_id?: string;
  created_at: string;
  updated_at: string;
}
```

---

## `src/types/dispatch.types.ts`

```typescript
export interface DispatchDocument {
  doc_id: string;
  deployment_id: string;
  document_type: DispatchDocumentType;
  pdf_blob_url?: string;
  qr_code_value?: string;
  qr_code_image_url?: string;
  generated_by_id: string;
  generated_at: string;
  printer_sent_at?: string;
  signed_copy_url?: string;
  signed_by_name?: string;
  signed_at?: string;
  status: DispatchDocStatus;
  sap_gi_triggered: boolean;
  sap_gi_triggered_at?: string;
}
```

---

## `src/types/inspection.types.ts`

```typescript
export interface InspectionRecord {
  inspection_id: string;
  deployment_id: string;
  overall_condition?: OverallCondition;
  notes?: string;
  inspected_by_id: string;
  inspected_at: string;
  repair_case_id?: string;
  created_at: string;
  line_items?: InspectionLineItem[];
}

export interface InspectionLineItem {
  item_id: string;
  inspection_id: string;
  bom_line_id: string;
  result: InspectionResult;
  quantity_actual?: number;
  notes?: string;
  inspection_type: InspectionType;
}
```

---

## `src/types/repair.types.ts`

```typescript
export interface RepairCase {
  repair_id: string;
  rs_number: string;                    // e.g., RS-202602-099595
  eas_no?: string;
  asset_id: string;
  account_id: string;
  sfdc_repair_id?: string;
  status: RepairCaseStatus;
  repair_type: RepairType;
  area?: AreaCode;
  repair_cost_thb?: number;
  fse_assigned_id?: string;
  created_at: string;
}
```

---

## `src/types/account.types.ts`

```typescript
export interface Account {
  account_id: string;
  account_name: string;
  address?: string;
  area?: AreaCode;
  department?: string;
  segmentation?: string;
  group_wave?: string;
  created_at: string;
}
```

---

## `src/types/eventLog.types.ts`

```typescript
export interface EventLog {
  log_id: string;
  entity_type: EventEntityType;
  entity_id: string;
  event_type: EventType;
  old_value?: string;                   // JSON string for complex changes
  new_value?: string;
  actor_id?: string;
  actor_type: ActorType;
  timestamp: string;
  narrative: string;                    // "[User] changed status from X → Y on [Date]" — pre-formatted by backend
  ip_address?: string;
  session_id?: string;
}
```

---

## `src/types/user.types.ts`

```typescript
export interface User {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string;
  area?: AreaCode;
  sfdc_user_id?: string;
  is_active: boolean;
}
```

---

## `src/types/report.types.ts`

```typescript
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
```

---

## `src/types/dashboard.types.ts`

Response shape interfaces for each dashboard API endpoint:

```typescript
export interface SalesDashboardData {
  // Aggregates from sales_requests by status, purpose2, sales_person_id
  // and device_deployments.days_outstanding
  [key: string]: unknown;
}

export interface EQCDashboardData {
  // Aggregates from sales_requests.status, dispatch_documents.status,
  // device_deployments.status, inspection_records
  [key: string]: unknown;
}

export interface InventoryDashboardData {
  // Aggregates from assets.status, warehouse_code, model_code,
  // demo_loaner_type, condition_grade, annual_inspection_status
  [key: string]: unknown;
}

export interface OverdueFeedData {
  // device_deployments where days_outstanding > 0
  // ai_prediction_log.prediction_output, teams_alert_log
  [key: string]: unknown;
}

export interface ExecutiveDashboardData {
  // sales_requests aggregates, device_deployments.rental_rate_thb,
  // repair_cases.repair_cost_thb, ai_prediction_log (OVERDUE_FORECAST),
  // event_log aggregates
  [key: string]: unknown;
}

export interface FinanceDashboardData {
  // device_deployments.rental_rate_thb, billing_cycle, is_billable
  // repair_cases.repair_cost_thb, assets.total_repair_amount_thb
  [key: string]: unknown;
}
```

> The dashboard data interfaces will be filled in with exact field shapes once the backend dashboard endpoints are implemented. The `[key: string]: unknown` placeholder allows progressive typing without blocking frontend development.
