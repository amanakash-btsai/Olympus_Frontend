// ─────────────────────────────────────────────────────────────────────────────
// FILE: types/enums.ts (frontend)
// All domain type definitions used across the frontend — mirrors the backend
// enums. Using TypeScript union types catches typos at compile time.
//
// These are used in:
//   - API function parameter types (e.g. filter by AssetStatus)
//   - useHasRole() checks (e.g. useHasRole('EQC_Manager'))
//   - Badge colors (statusHelpers.ts maps these to color classes)
//   - Form dropdowns (these are the allowed values)
// ─────────────────────────────────────────────────────────────────────────────

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
