# EQC Asset Management Platform — Frontend Technical Specification

**Organization:** OTH Equipment Co. | Olympus Thailand Medical Division  
**Version:** 1.1 | May 2026  
**Schema Source:** EQC_Objects_and_Attributes.xlsx v2.0 — OTH Equipment Co. | Olympus Thailand Medical Division  
**Confidentiality:** INTERNAL USE ONLY

---

## Document Purpose

This document provides the complete technical specification for the EQC frontend application — a React 18 / TypeScript single-page application (SPA) built with Vite, deployed on Azure Static Web Apps (or optionally on AKS alongside the backend). It covers every file and its purpose, all pages and routes, Azure AD MSAL authentication integration, role-based access control, API integration patterns, state management, component architecture, the six role-gated dashboards, the full reports section, environment variable reference, testing strategy, and development roadmap.

This document is designed to be used directly by Claude Code (or any developer) to generate the complete frontend application without ambiguity. Where the UI design for individual dashboards has not yet been provided, this document specifies data requirements and component responsibilities so that HTML layout files can be dropped in and wired up without restructuring.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Folder and File Structure](#3-folder-and-file-structure)
4. [Data Model & Schema Reference](#4-data-model--schema-reference)
   - 4.1 Object Summary (17 objects)
   - 4.2 Complete Field Reference (all fields, types, keys)
   - 4.3 ENUM / Status Value Reference
   - 4.4 Object Relationships
5. [Authentication — Azure AD MSAL Integration](#5-authentication--azure-ad-msal-integration)
6. [Routing & Role-Based Access Control](#6-routing--role-based-access-control)
7. [API Integration Layer](#7-api-integration-layer)
8. [State Management](#8-state-management)
9. [Pages & Feature Modules](#9-pages--feature-modules)
10. [Dashboards — All Six Dashboards](#10-dashboards--all-six-dashboards)
11. [Reports Section](#11-reports-section)
12. [Shared Components Library](#12-shared-components-library)
13. [Environment Variable Reference](#13-environment-variable-reference)
14. [Verification Plan](#14-verification-plan)
15. [Development Roadmap](#15-development-roadmap)

---

## 1. Executive Summary

The EQC frontend is a role-aware, real-time enterprise SPA that serves six distinct user personas — Sales, EQC Operator, EQC/Sales Manager, Finance, Warehouse, and Admin — each with their own tailored dashboard, navigation, and permitted actions.

The frontend communicates exclusively with the EQC backend REST API (specified in `EQC_Backend_Technical_Spec.md`). It does not connect directly to Salesforce, SAP, Azure Blob, or Teams — all integrations are orchestrated by the backend. The frontend's only direct external dependency is Azure Active Directory for authentication via the MSAL library.

### Key Architectural Principles

- **MSAL-first authentication** — no username/password forms for production users; all login flows go through Azure AD popup/redirect. The JWT access token acquired from MSAL is forwarded to the backend on every API call.
- **Token is stored in memory only** — never in `localStorage` or `sessionStorage`. MSAL handles its own token cache via `sessionStorage` internally; the backend-issued access token is kept in React state/context only.
- **Role-based rendering** — the sidebar, navigation, and page availability are entirely governed by the user's role as returned in the JWT payload from the backend.
- **Optimistic UI where safe, pessimistic where critical** — status transitions (approve, dispatch, inspect) always wait for server confirmation before updating UI. Non-destructive reads use stale-while-revalidate via TanStack Query.
- **Extensible dashboard architecture** — each dashboard is an isolated route module. New dashboards or new sections within existing dashboards can be added without modifying any other page.
- **DB schema and UI design are subject to change** — all data-fetching hooks are centralized in `src/api/` and all UI layouts are isolated in `src/pages/` so that schema changes require only hook updates, and design changes require only layout updates.
- **Dispatch block is enforced on the server** — the frontend shows the `DISPATCH_BLOCKED` error with the `missingItems` list when the backend returns HTTP 409, but never attempts to enforce or bypass this rule itself.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 | Component model, concurrent rendering |
| Language | TypeScript (strict mode) | Type safety, compile-time error detection |
| Build Tool | Vite 5 | Fast HMR dev server, optimized production bundle |
| Routing | React Router v6 | Nested routes, lazy-loading, protected route wrappers |
| Auth | @azure/msal-browser + @azure/msal-react | Azure AD OAuth2 / OIDC, token acquisition |
| Data Fetching | TanStack Query v5 (React Query) | Server state, caching, background refresh, pagination |
| HTTP Client | Axios | Interceptors for Bearer token injection, error normalization |
| Form Handling | React Hook Form + Zod | Validated forms with type inference from Zod schemas |
| UI Component Library | shadcn/ui (Radix UI primitives + Tailwind CSS) | Accessible, unstyled-first component primitives |
| Styling | Tailwind CSS v3 | Utility-first CSS, consistent design tokens |
| Charts | Recharts | Responsive SVG charts for dashboards |
| Tables | TanStack Table v8 | Sortable, filterable, paginated data tables |
| Date Handling | date-fns | Lightweight date formatting and arithmetic |
| Notifications | react-hot-toast | Toast notifications for success/error feedback |
| File Export | xlsx (SheetJS) + jspdf | Client-side Excel and PDF export for reports |
| Testing | Vitest + React Testing Library + MSW | Unit/integration tests with mocked API |
| Linting | ESLint + Prettier | Code quality and formatting |
| CI/CD | Azure DevOps Pipelines | Build, test, deploy to Azure Static Web Apps |
| Hosting | Azure Static Web Apps | Global CDN, free SSL, built-in routing rules |

---

## 3. Folder and File Structure

Every file in the project is listed below with a plain-English description of its purpose, organized by directory layer.

### 3.1 Root Level & Configuration Files

**`.env.example`**  
Template showing all required environment variables. Committed to source control. Developers copy this to `.env.local` and fill in values. Never committed with real values.

**`.gitignore`**  
Excludes: `node_modules/`, `dist/`, `.env.local`, `coverage/`, `*.log`.

**`index.html`**  
Vite entry HTML. Contains the `<div id="root">` mount point and the `<script type="module" src="/src/main.tsx">` entry reference. No inline scripts.

**`vite.config.ts`**  
Vite configuration. Sets `@` path alias to `./src`. Enables React plugin. Configures proxy for `/api` to backend in development (avoids CORS issues during dev). Sets build output to `dist/`.

**`tsconfig.json`**  
TypeScript strict mode. Path aliases: `@` → `src/`. `target: ES2020`. `moduleResolution: bundler`. `jsx: react-jsx`.

**`tsconfig.node.json`**  
TypeScript config for Vite config file itself (Node context).

**`tailwind.config.ts`**  
Tailwind configuration. Extends default theme with Olympus brand colors (primary blue, accent teal, neutral grays). Configures content paths for purging unused classes.

**`package.json`**  
Project manifest. Scripts: `dev` (vite), `build` (tsc && vite build), `preview` (vite preview), `test` (vitest), `lint` (eslint), `format` (prettier).

**`eslint.config.ts`**  
ESLint flat config. Uses `@typescript-eslint/recommended`, `plugin:react-hooks/recommended`, `plugin:jsx-a11y/recommended`. Enforces no `console.log` in production files.

**`staticwebapp.config.json`**  
Azure Static Web Apps routing rules. Routes all paths to `index.html` for SPA client-side routing. Sets security headers (CSP, HSTS, X-Frame-Options). Configures MIME types.

---

### 3.2 Entry Points (src/)

**`src/main.tsx`**  
Application entry point. Creates the MSAL `PublicClientApplication` instance from `msalConfig`. Wraps the React tree in `MsalProvider`, `BrowserRouter`, and `QueryClientProvider`. Renders `<App />`.

```tsx
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { msalConfig } from "@/authConfig";
import App from "@/App";

const msalInstance = new PublicClientApplication(msalConfig);
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } } });

root.render(
  <MsalProvider instance={msalInstance}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </MsalProvider>
);
```

**`src/App.tsx`**  
Root component. Renders the route tree via `<RouterProvider>` (or `<Routes>` if using `BrowserRouter`). Conditionally renders `<AuthenticatedLayout>` vs `<LoginPage>` based on MSAL authentication state via `useIsAuthenticated()`. Also renders the `<Toaster />` for global toast notifications.

---

### 3.3 Authentication Config (src/authConfig.ts)

**`src/authConfig.ts`**  
Single file containing all MSAL configuration. Exported constants are consumed by `main.tsx` and `src/api/axiosInstance.ts`.

```typescript
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_AD_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [`api://${import.meta.env.VITE_BACKEND_CLIENT_ID}/access_as_user`],
};
```

---

### 3.4 Type Definitions (src/types/)

**`src/types/auth.types.ts`**  
TypeScript interface for the authenticated user object: `AuthUser { id: string, email: string, name: string, role: UserRole, sfdc_user_id?: string }`. The `role` field uses the `UserRole` union type.

**`src/types/enums.ts`**  
All application string-literal union types mirroring the backend schema. These are union types (not TypeScript `enum`) to allow direct comparison with API string values without transformation.

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

// Device Deployment status (the deployment sub-record, not the request)
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

**`src/types/api.types.ts`**  
Response shape interfaces: `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError { code, message, details }`. Used by all query hooks to type API responses correctly.

**`src/types/asset.types.ts`**  
Interfaces for the `assets` table:

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

**`src/types/salesRequest.types.ts`**  
Interfaces for the `sales_requests` table — the primary operational object:

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

**`src/types/extension.types.ts`**  
Interfaces for the `request_extensions` table:

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

**`src/types/bom.types.ts`**  
Interfaces for `bom_sets`, `bom_line_items`, and `accessory_master` tables:

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
  // Populated via join
  accessory?: AccessoryMaster;
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
  missingItems: Array<{ line_id: string; accessory_name: string; quantity_required: number }>;
}
```

**`src/types/deployment.types.ts`**  
Interfaces for the `device_deployments` table (the asset-to-request link record):

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

**`src/types/dispatch.types.ts`**  
Interfaces for the `dispatch_documents` table:

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

**`src/types/inspection.types.ts`**  
Interfaces for `inspection_records` and `inspection_line_items` tables:

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

**`src/types/repair.types.ts`**  
Interfaces for the `repair_cases` table:

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

**`src/types/account.types.ts`**  
Interfaces for the `accounts` table:

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

**`src/types/eventLog.types.ts`**  
Interfaces for the `event_log` table (immutable audit trail):

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
  narrative: string;                    // e.g., "[User] changed status from X → Y on [Date]"
  ip_address?: string;
  session_id?: string;
}
```

**`src/types/user.types.ts`**  
Interfaces for the `users` table:

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

**`src/types/report.types.ts`**  
`ReportType`, `ReportFilter`, `ReportRow`, `ScheduledReport` interfaces. Report types: `SalesRequestSummary`, `LoanerBilling`, `InspectionDefects`, `AssetUtilization`, `OverdueAnalysis`, `BOMCompliance`, `RepairCaseSummary`.

**`src/types/dashboard.types.ts`**  
Response shape interfaces for each dashboard API endpoint: `SalesDashboardData`, `EQCDashboardData`, `InventoryDashboardData`, `OverdueFeedData`, `ExecutiveDashboardData`, `FinanceDashboardData`.

---

### 3.5 API Layer (src/api/)

**`src/api/axiosInstance.ts`**  
Axios instance with base URL from `VITE_API_BASE_URL`. Request interceptor: acquires token silently via MSAL `acquireTokenSilent({ scopes: loginRequest.scopes })`, attaches `Authorization: Bearer {token}` header. Response interceptor: normalizes errors into `ApiError` shape. On 401, clears auth state and redirects to login. On network error, throws a user-friendly message.

```typescript
// Request interceptor pattern
axiosInstance.interceptors.request.use(async (config) => {
  const response = await msalInstance.acquireTokenSilent(loginRequest);
  config.headers.Authorization = `Bearer ${response.accessToken}`;
  return config;
});
```

**`src/api/auth.api.ts`**  
`getMe(): Promise<AuthUser>` — calls `GET /api/auth/me`. Used on app load to fetch the authenticated user's profile and role.

**`src/api/assets.api.ts`**  
Functions targeting the `assets` table. `listAssets(filters)`, `getAsset(asset_id)`, `createAsset(payload: CreateAssetPayload)`, `updateAsset(asset_id, payload: UpdateAssetPayload)`, `transitionAssetStatus(asset_id, status: AssetStatus)`. Filters: `status`, `model_code`, `warehouse_code`, `demo_loaner_type`, `business_unit`, `area`, `is_active`.

**`src/api/salesRequests.api.ts`**  
Functions targeting the `sales_requests` table — the primary request object. `listSalesRequests(filters)`, `getSalesRequest(request_id)`, `createSalesRequest(payload: CreateSalesRequestPayload)`, `approveSalesRequest(request_id)`, `rejectSalesRequest(request_id, rejection_reason)`, `markReturned(request_id)`, `cancelSalesRequest(request_id)`. Filters: `status`, `record_type`, `purpose1`, `purpose2`, `account_id`, `sales_person_id`, `date_range`.

**`src/api/extensions.api.ts`**  
Functions targeting the `request_extensions` table. `createExtension(payload: CreateExtensionPayload)`, `listExtensions(parent_request_id)`, `approveExtension(extension_id)`, `rejectExtension(extension_id)`.

**`src/api/deployments.api.ts`**  
Functions targeting the `device_deployments` table (the asset-to-request link record, not the request itself). `listDeployments(filters)`, `getDeployment(deployment_id)`, `createDeployment(request_id, asset_id, payload)`, `transitionDeploymentStatus(deployment_id, status: DeploymentStatus)`. Note: most operational actions are taken on the `SalesRequest` level; the `DeviceDeployment` is updated as a side-effect by the backend.

**`src/api/bom.api.ts`**  
Functions targeting `bom_sets`, `bom_line_items`, and `accessory_master`. `listBOMSets(model_code?)`, `getBOMSet(set_id)`, `createBOMSet(payload)`, `updateBOMSet(set_id, payload)`, `getBOMLineItems(set_id)`, `createBOMLineItem(set_id, payload)`, `updateBOMLineItem(line_id, payload)`, `listAccessoryMaster(filters)`, `validatePacking(bom_set_id, packed_line_ids: string[])` → `PackingValidationResult`.

**`src/api/dispatch.api.ts`**  
Functions targeting `dispatch_documents`. `generateDispatchDocument(request_id, document_type)`, `getDispatchDocument(doc_id)`, `listDispatchDocuments(filters)`, `markSentToPrint(doc_id)`, `uploadSignedCopy(doc_id, file: File, signed_by_name: string)`. Filters: `status`, `deployment_id`, `date_range`.

**`src/api/inspection.api.ts`**  
Functions targeting `inspection_records` and `inspection_line_items`. `createInspection(deployment_id)`, `getInspection(inspection_id)`, `recordLineItemResult(inspection_id, line_id, result: InspectionResult, quantity_actual?, notes?)`, `completeInspection(inspection_id, overall_condition: OverallCondition, notes?)`.

**`src/api/repairCases.api.ts`**  
Functions targeting `repair_cases`. `listRepairCases(filters)`, `getRepairCase(repair_id)`, `updateRepairCase(repair_id, payload)`. Filters: `status`, `asset_id`, `account_id`, `area`, `repair_type`. Create is handled automatically by the backend on inspection FAIL — the frontend only reads and updates.

**`src/api/dashboard.api.ts`**  
`getSalesDashboard()`, `getEQCDashboard()`, `getInventoryDashboard()`, `getOverdueFeed()`, `getExecutiveDashboard()`, `getFinanceDashboard()`. Each returns a strongly-typed dashboard data object.

**`src/api/reports.api.ts`**  
`getReportData(type: ReportType, filters)`, `exportReport(type, filters, format: 'xlsx'|'csv'|'pdf')`, `scheduleReport(payload)`, `listScheduledReports()`, `deleteScheduledReport(id)`.

**`src/api/accounts.api.ts`**  
Functions targeting the `accounts` table. `listAccounts(filters)`, `getAccount(account_id)`, `createAccount(payload)`, `updateAccount(account_id, payload)`. Filters: `area`, `segmentation`, `group_wave`.

**`src/api/users.api.ts`**  
Functions targeting the `users` table. `listUsers()`, `getUser(user_id)`, `createUser(payload)`, `updateUserRole(user_id, role: UserRole)`, `deactivateUser(user_id)`. Roles available: `Sales_Rep`, `FSE`, `EQC_Operator`, `EQC_Manager`, `Sales_Manager`, `Executive`, `System_Admin`. `Integration_Service` is system-only and not assignable via UI. ADMIN (`System_Admin`) only.

**`src/api/eventLog.api.ts`**  
Functions targeting the `event_log` table. `getEventLog(entity_type: EventEntityType, entity_id, pagination)` — returns paginated `EventLog[]` for the entity timeline feed. `getEventLogByUser(user_id, pagination)` — for admin audit views. The event log is immutable — no create/update/delete operations from the frontend.

**`src/api/serviceContracts.api.ts`**  
`listServiceContracts(asset_id?)`, `getServiceContract(contract_id)`. Viewing only from the frontend; contracts are managed by admins.

---

### 3.6 Hooks (src/hooks/)

**`src/hooks/useAuth.ts`**  
Custom hook wrapping `useMsal()` and the `AuthUser` context. Returns `{ user, isLoading, isAuthenticated, login, logout }`. `login()` calls `instance.loginPopup(loginRequest)`. `logout()` calls `instance.logoutPopup()`. After successful login, calls `getMe()` to fetch backend user profile.

**`src/hooks/useCurrentUser.ts`**  
Returns the `AuthUser` from context. Throws if called outside `AuthProvider`. Used throughout the app to access `user.role` for RBAC rendering.

**`src/hooks/useHasRole.ts`**  
`useHasRole(...roles: UserRole[]): boolean` — returns `true` if the current user's role is in the allowed list. Used for conditional rendering of UI elements.

**`src/hooks/useAssets.ts`**  
TanStack Query hooks for the `assets` table: `useAssets(filters)`, `useAsset(asset_id)`, `useCreateAsset()`, `useUpdateAsset()`, `useTransitionAssetStatus()`. All mutations invalidate `['assets']` and any dashboard queries that include asset counts on success.

**`src/hooks/useSalesRequests.ts`**  
TanStack Query hooks for the `sales_requests` table: `useSalesRequests(filters)`, `useSalesRequest(request_id)`, `useCreateSalesRequest()`, `useApproveSalesRequest()`, `useRejectSalesRequest()`, `useMarkReturned()`, `useCancelSalesRequest()`. All mutations invalidate `['salesRequests']` and relevant dashboard caches.

**`src/hooks/useExtensions.ts`**  
`useExtensions(parent_request_id)`, `useCreateExtension()`, `useApproveExtension()`, `useRejectExtension()`. Mutations invalidate the parent `SalesRequest` query.

**`src/hooks/useDeployments.ts`**  
TanStack Query hooks for the `device_deployments` table: `useDeployments(filters)`, `useDeployment(deployment_id)`. Most deployment state changes flow from `useSalesRequests` mutations; this hook is used primarily for reading deployment details and history.

**`src/hooks/useBOM.ts`**  
`useBOMSets(model_code?)`, `useBOMSet(set_id)`, `useBOMLineItems(set_id)`, `useAccessoryMaster(filters)`, `useCreateBOMSet()`, `useUpdateBOMSet()`, `useCreateBOMLineItem()`, `useUpdateBOMLineItem()`, `useValidatePacking()`.

**`src/hooks/useDispatch.ts`**  
`useDispatchDocuments(filters)`, `useDispatchDocument(doc_id)`, `useGenerateDispatchDocument()`, `useMarkSentToPrint()`, `useUploadSignedCopy()`.

**`src/hooks/useInspection.ts`**  
`useInspection(inspection_id)`, `useCreateInspection()`, `useRecordLineItemResult()`, `useCompleteInspection()`.

**`src/hooks/useRepairCases.ts`**  
`useRepairCases(filters)`, `useRepairCase(repair_id)`, `useUpdateRepairCase()`.

**`src/hooks/useDashboard.ts`**  
`useSalesDashboard()`, `useEQCDashboard()`, `useInventoryDashboard()`, `useOverdueFeed()`, `useExecutiveDashboard()`, `useFinanceDashboard()`. All use `{ staleTime: 5 * 60 * 1000, refetchInterval: 5 * 60 * 1000 }` for 5-minute auto-refresh as specified in the solution design.

**`src/hooks/useReports.ts`**  
`useReportData(type, filters)`, `useExportReport()`, `useScheduledReports()`, `useCreateScheduledReport()`, `useDeleteScheduledReport()`.

**`src/hooks/usePagination.ts`**  
Generic hook managing `page`, `limit`, `setPage`, `setLimit` state. Used alongside TanStack Table for server-side pagination.

**`src/hooks/useDebounce.ts`**  
`useDebounce<T>(value: T, delay: number): T` — debounces search input before firing API calls.

---

### 3.7 Context Providers (src/context/)

**`src/context/AuthContext.tsx`**  
React context holding the authenticated `AuthUser` object. `AuthProvider` wraps the app inside `MsalProvider`. On mount, calls `getMe()` if MSAL reports an active account. Exposes `user`, `setUser`, `isLoading`. Children consume via `useCurrentUser()` hook.

**`src/context/ThemeContext.tsx`**  
Light/dark mode context (optional, defaults to light). Reads from `localStorage`. Applies `dark` class to `<html>` element for Tailwind dark mode variant.

---

### 3.8 Layouts (src/layouts/)

**`src/layouts/AuthenticatedLayout.tsx`**  
Shell layout for all authenticated pages. Renders `<Sidebar />`, `<TopNav />`, and `<main>` content area with `<Outlet />`. Fetches current user on mount via `useCurrentUser()`. Redirects to `/login` if not authenticated.

**`src/layouts/PublicLayout.tsx`**  
Minimal layout for unauthenticated pages (login, error pages). Renders only the Olympus logo and content area.

---

### 3.9 Routing (src/router/)

**`src/router/index.tsx`**  
Main route configuration. Uses `createBrowserRouter`. Top-level routes:
- `/login` → `<LoginPage />`
- `/` → `<AuthenticatedLayout />` with nested routes:
  - `/dashboard` → Role-resolved dashboard (see Section 9)
  - `/sales-requests` → Sales request list/form
  - `/assets` → Asset management
  - `/bom` → BOM management
  - `/dispatch` → Dispatch workflow
  - `/inspections` → Inspection workflow
  - `/reports` → Reports section
  - `/accounts` → Account management
  - `/users` → User management (ADMIN only)
  - `/audit` → Audit log viewer (ADMIN/MANAGER)
  - `*` → `<NotFoundPage />`

**`src/router/ProtectedRoute.tsx`**  
Wrapper component. Checks `useIsAuthenticated()`. If false, redirects to `/login` with the current path saved in location state. If authenticated but role not in `allowedRoles` prop, renders `<UnauthorizedPage />`.

**`src/router/RoleRedirect.tsx`**  
At `/dashboard`, resolves which dashboard sub-route to redirect to based on `user.role`:
- `Sales_Rep` → `/dashboard/sales`
- `FSE` → `/dashboard/sales`
- `EQC_Operator` → `/dashboard/eqc`
- `EQC_Manager` → `/dashboard/manager`
- `Sales_Manager` → `/dashboard/manager`
- `Executive` → `/dashboard/executive`
- `System_Admin` → `/dashboard/executive`
- `Integration_Service` → `/dashboard/inventory` (service account — read-only view)

---

### 3.10 Pages (src/pages/)

Each page is a standalone module folder with its own component, sub-components, and any page-local hooks. Pages do not import from other page folders — shared code lives in `src/components/` or `src/hooks/`.

**`src/pages/Login/LoginPage.tsx`**  
Renders the Olympus logo, application name, and a "Sign in with Olympus" button. Calls `login()` from `useAuth()` on click. If MSAL returns an active account on page load, auto-redirects to `/dashboard`. Shows a spinner during the login popup flow.

**`src/pages/Dashboard/`**  
Six dashboard sub-pages (see Section 9 for full specification):
- `SalesDashboard.tsx`
- `EQCDashboard.tsx`
- `ManagerDashboard.tsx`
- `InventoryDashboard.tsx`
- `ExecutiveDashboard.tsx`
- `FinanceDashboard.tsx`

**`src/pages/SalesRequests/`**  
- `SalesRequestListPage.tsx` — table of all deployments visible to the current user (filtered by role). Columns: ID, type, account, device, status, dates, assigned EQC, actions.
- `SalesRequestDetailPage.tsx` — full deployment record with timeline, BOM snapshot, dispatch doc link, inspection summary.
- `CreateSalesRequestPage.tsx` — form to create a new Demo or Loaner request. Fields: type, account (searchable dropdown), device model, start date, end date, notes.

**`src/pages/Assets/`**  
- `AssetListPage.tsx` — paginated, filterable asset table. Filters: status, model code, warehouse, condition. ADMIN can create assets; EQC/MANAGER can transition status.
- `AssetDetailPage.tsx` — asset record with full deployment history, current status, BOM assignment, and audit timeline.
- `CreateAssetPage.tsx` — ADMIN-only form to create an asset record.

**`src/pages/BOM/`**  
- `BOMSetsPage.tsx` — list of BOM sets by model code. ADMIN can create/edit sets and components.
- `BOMSetDetailPage.tsx` — components table for a set. Shows required vs optional items, quantities, SAP material codes.
- `BOMPackingPage.tsx` — the packing checklist UI for an active deployment. EQC operator ticks each component as packed. "Validate Packing" button calls `validatePacking()`. Shows `missingItems` list prominently in red if returned. "Generate Dispatch Document" button is disabled until packing is validated as complete.

**`src/pages/Dispatch/`**  
- `DispatchListPage.tsx` — list of all dispatch documents with status (GENERATED, SIGNED). Filterable by date range and status.
- `DispatchDocumentPage.tsx` — dispatch document detail: PDF preview link (SAS URL), QR code display, signed copy upload form (file input + date picker). Upload calls `uploadSignedCopy()`.
- `GenerateDispatchPage.tsx` — wizard for generating a dispatch document. Step 1: select deployment. Step 2: confirm BOM snapshot. Step 3: validate packing. Step 4: generate. Shows 409 `DISPATCH_BLOCKED` error inline with the missing items list if packing is incomplete.

**`src/pages/Inspection/`**  
- `InspectionListPage.tsx` — list of all inspection records with status and asset reference.
- `InspectionDetailPage.tsx` — per-component inspection form. Shows each BOM component from the frozen snapshot. EQC operator sets PASS/FAIL/MISSING per row. Notes field. "Complete Inspection" button — triggers `completeInspection()` which finalizes the record and triggers asset status update on the backend.
- `CreateInspectionPage.tsx` — creates a new inspection session for a returned deployment.

**`src/pages/RepairCases/`**  
- `RepairCaseListPage.tsx` — paginated, filterable list of `repair_cases`. Filters: `status`, `repair_type`, `area`, `asset_id`, date range. Columns: `rs_number`, `eas_no`, asset name, account, `repair_type`, `status`, `area`, `repair_cost_thb`, FSE assigned, `created_at`. Repair cases are auto-created by the backend on inspection FAIL — the frontend provides read and update capability only.
- `RepairCaseDetailPage.tsx` — full repair case record with linked asset detail, linked `sales_request` (if loaner-triggered), inspection line items that caused the repair, current `status`, and event log timeline. EQC/FSE users can update `status` and `repair_cost_thb`. Links back to the originating inspection and asset.

**`src/pages/Accounts/`**  
- `AccountListPage.tsx` — paginated account list with search. Filters: `area` (CENTRAL/EAST/NORTH/SOUTH/LAOS), `segmentation`, `group_wave`.
- `AccountDetailPage.tsx` — account record with active deployments (from `sales_requests`), repair cases at this account, and asset history.

**`src/pages/Users/`** (ADMIN only)  
- `UserListPage.tsx` — list of all users with role badges. Admin can update roles and deactivate users.

**`src/pages/Reports/`**  
Full reports section — see Section 10 for complete specification.

**`src/pages/Audit/`**  
- `AuditLogPage.tsx` — searchable, paginated `event_log` viewer. Filters: `entity_type` (asset / sales_request / deployment / dispatch_doc / inspection / repair_case / bom_set), `entity_id`, `event_type`, `actor_type`, date range, `actor_id` (user). Displays each `event_log.narrative` as a human-readable activity feed: e.g., "[User] changed status from Dispatched → With_Customer on [Date]". The `narrative` field is pre-formatted by the backend — the frontend renders it directly without transformation. `actor_type = AI_Agent` or `Integration` rows are visually distinguished with an icon.

**`src/pages/NotFound/NotFoundPage.tsx`**  
404 page with navigation back to dashboard.

**`src/pages/Unauthorized/UnauthorizedPage.tsx`**  
403 page shown when a user navigates to a route their role does not permit.

---

### 3.11 Components Library (src/components/)

See Section 11 for full component reference. Directory overview:

```
src/components/
├── ui/                    # shadcn/ui re-exported primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Dialog.tsx
│   ├── Dropdown.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Tabs.tsx
│   ├── Table.tsx
│   ├── Skeleton.tsx
│   └── Tooltip.tsx
├── layout/
│   ├── Sidebar.tsx
│   ├── TopNav.tsx
│   ├── PageHeader.tsx
│   └── ContentCard.tsx
├── data/
│   ├── DataTable.tsx
│   ├── Pagination.tsx
│   ├── FilterBar.tsx
│   ├── SearchInput.tsx
│   ├── SortableHeader.tsx
│   └── EmptyState.tsx
├── charts/
│   ├── KPICard.tsx
│   ├── BarChart.tsx
│   ├── LineChart.tsx
│   ├── DonutChart.tsx
│   └── TrendBadge.tsx
├── status/
│   ├── AssetStatusBadge.tsx
│   ├── DeploymentStatusBadge.tsx
│   ├── SeverityBadge.tsx
│   └── StatusTimeline.tsx
├── forms/
│   ├── FormField.tsx
│   ├── DateRangePicker.tsx
│   ├── AccountSelector.tsx
│   ├── AssetSelector.tsx
│   └── RoleGuard.tsx
└── feedback/
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    ├── AlertBanner.tsx
    └── ConfirmDialog.tsx
```

---

### 3.12 Utils (src/utils/)

**`src/utils/formatters.ts`**  
`formatDate(date, locale?)`, `formatDateTH(date)` (Thai locale), `formatCurrency(amount, currency?)`, `formatDuration(days)`, `formatDeploymentId(id)`.

**`src/utils/statusHelpers.ts`**  
`getAssetStatusColor(status: AssetStatus)` → Tailwind color class (maps all 15 `AssetStatus` values). `getSalesRequestStatusColor(status: SalesRequestStatus)` → Tailwind color class (maps all 11 `SalesRequestStatus` values). `getRepairCaseStatusColor(status: RepairCaseStatus)`. `getDispatchDocStatusColor(status: DispatchDocStatus)`. `getSeverityColor(daysOverdue: number)` → color class for overdue severity banding. `isOverdue(expected_return_date: string)` → boolean. `daysOverdue(expected_return_date: string)` → number (positive = overdue, negative = days remaining).

**`src/utils/roleHelpers.ts`**  
Predicate functions for conditional rendering of action buttons. All accept `role: UserRole`:

```typescript
canApproveRequests(role)      // EQC_Manager, Sales_Manager, System_Admin
canManageBOM(role)            // EQC_Operator, EQC_Manager, System_Admin
canGenerateDispatch(role)     // EQC_Operator, EQC_Manager, System_Admin
canPerformInspection(role)    // EQC_Operator, EQC_Manager, System_Admin
canUpdateRepairCase(role)     // FSE, EQC_Operator, EQC_Manager, System_Admin
canManageUsers(role)          // System_Admin only
canViewFinancials(role)       // Sales_Manager, EQC_Manager, Executive, System_Admin
canCreateAsset(role)          // System_Admin only
canManageAccounts(role)       // Sales_Rep, FSE, EQC_Manager, Sales_Manager, System_Admin
isEQCRole(role)               // EQC_Operator, EQC_Manager
isManagerRole(role)           // EQC_Manager, Sales_Manager, Executive
```

**`src/utils/exportHelpers.ts`**  
`exportToExcel(data, filename)` — uses SheetJS to generate `.xlsx` client-side. `exportToCSV(data, filename)`. `exportToPDF(data, filename)` — uses jspdf for simple tabular PDFs. These are used in the Reports section for client-side export of report data received from the API.

**`src/utils/queryHelpers.ts`**  
`buildQueryString(filters)` — converts a filters object to a URL query string. `parseQueryString(search)` — parses query string back to filters object. Used to persist filter state in the URL.

---

### 3.13 Tests (src/tests/)

**`src/tests/setup.ts`**  
Vitest global setup. Imports `@testing-library/jest-dom` matchers. Starts MSW service worker to intercept API calls.

**`src/tests/mocks/handlers.ts`**  
MSW request handlers for all API endpoints. Returns fixture data matching the backend's `ApiResponse<T>` shape. Includes handlers for 409 `DISPATCH_BLOCKED`, 403 `INSUFFICIENT_PERMISSIONS`, and 401 `UNAUTHORIZED`.

**`src/tests/mocks/fixtures/`**  
JSON fixture files: `assets.json`, `deployments.json`, `bom.json`, `dashboards.json`, `users.json`.

**`src/tests/unit/hooks/`**  
Unit tests for custom hooks using `renderHook` + MSW: `useAssets.test.ts`, `useDashboard.test.ts`, `useAuth.test.ts`.

**`src/tests/unit/utils/`**  
Unit tests for pure utilities: `statusHelpers.test.ts`, `formatters.test.ts`, `roleHelpers.test.ts`.

**`src/tests/integration/`**  
Integration tests for critical flows: `dispatchBlockedFlow.test.tsx`, `inspectionFlow.test.tsx`, `loginFlow.test.tsx`, `rbacRendering.test.tsx`.

---

## 4. Data Model & Schema Reference

This section documents the complete data model extracted from `EQC_Objects_and_Attributes.xlsx` (Version 2.0, May 2026). The frontend type definitions in `src/types/` are derived directly from this source of truth. When the backend schema changes, update this section and the corresponding type files — all hooks and components consume typed interfaces and TypeScript will surface every usage that needs updating.

**Source document:** `EQC_Objects_and_Attributes.xlsx` — OTH Equipment Co. | Olympus Thailand Medical Division | Version 2.0 | May 2026

---

### 4.1 Object Summary

| # | Object Name | SQL Table | Source | Purpose | Field Count |
|---|-------------|-----------|--------|---------|-------------|
| 1 | Asset (Equipment) | `assets` | SFDC Asset (migrated) | Physical equipment unit — master record for all lifecycle operations | 32 |
| 2 | Sales Request | `sales_requests` | SFDC Demo_Loaner_Request__c (migrated) | Core Demo/Loaner request record — system of record replacing Salesforce | 35 |
| 3 | Request Extension | `request_extensions` | NEW | Extension records linked to parent sales_request; maintains extension history | 8 |
| 4 | BOM Set | `bom_sets` | NEW — replaces MS Access | Set definitions A–D with model code and version control | 10 |
| 5 | BOM Line Item | `bom_line_items` | NEW — replaces MS Access | Individual accessory per BOM set with required/optional/consumable flags | 9 |
| 6 | Accessory Master | `accessory_master` | NEW — replaces MS Access | Master catalog of all accessories with codes and device model mapping | 6 |
| 7 | Device Deployment | `device_deployments` | NEW (unified) | Active deployment linking asset to a sales_request with dates and status | 17 |
| 8 | Dispatch Document | `dispatch_documents` | NEW | PDF transport documents with QR code, signature tracking, and printer routing | 14 |
| 9 | Inspection Record | `inspection_records` | NEW | Return inspection result per deployment with BOM item outcomes | 8 |
| 10 | Inspection Line Item | `inspection_line_items` | NEW | Per-item inspection result (Pass/Fail/Missing) linked to BOM line | 7 |
| 11 | Repair Case | `repair_cases` | SFDC Repair__c (migrated) | Repair job record auto-created on inspection fail or damage | 12 |
| 12 | Account (Hospital) | `accounts` | SFDC Account (migrated) | Hospital organization records with location and contact data | 8 |
| 13 | Event Log | `event_log` | NEW | Immutable audit trail for all status transitions across all entities | 12 |
| 14 | Teams Alert Log | `teams_alert_log` | NEW | Record of all Teams adaptive card alerts sent with delivery status | 7 |
| 15 | Users | `users` | SFDC User (migrated) | System users with role, team, and area assignments | 8 |
| 16 | Service Contract | `service_contracts` | SFDC ServiceContract (migrated) | Maintenance/warranty contracts per asset | 6 |
| 17 | AI Prediction Log | `ai_prediction_log` | NEW | Overdue forecast and AI agent output history | 6 |

---

### 4.2 Complete Field Reference

#### Asset (Equipment) — `assets`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `asset_id` | UUID | PK | System-generated UUID | YES |
| `asset_name` | VARCHAR(100) | | Human-readable asset name (e.g., CH-S700-XZ-EA) | YES |
| `serial_number` | VARCHAR(50) | UNIQUE | Physical serial number | YES |
| `model_code` | VARCHAR(50) | | Equipment model code (e.g., GIF-Q158, OTV-S200) | YES |
| `model_name` | VARCHAR(200) | | Full model description | NO |
| `sap_asset_number` | VARCHAR(30) | | SAP ERP asset number for master data sync | NO |
| `sfdc_asset_id` | VARCHAR(20) | | Salesforce Asset record ID (18-char) | NO |
| `status` | ENUM | | See status ENUM table below | YES |
| `demo_loaner_type` | ENUM | | Asset category classification | YES |
| `warehouse_code` | VARCHAR(50) | | Current warehouse/storage location | NO |
| `installation_location` | VARCHAR(200) | | Specific installation location at hospital | NO |
| `account_id` | UUID | FK → accounts | Current owning or hosting hospital account | NO |
| `fse_owner_id` | UUID | FK → users | Assigned Field Service Engineer | NO |
| `business_unit` | VARCHAR(30) | | e.g., SE (Surgical Endoscopy), GI (Gastrointestinal) | NO |
| `oth_tier1` | VARCHAR(100) | | Product hierarchy level 1 | NO |
| `oth_tier2` | VARCHAR(100) | | Product hierarchy level 2 | NO |
| `oth_tier3` | VARCHAR(100) | | Product hierarchy level 3 | NO |
| `install_date` | DATE | | Commissioning date | NO |
| `warranty_start` | DATE | | Warranty start date | NO |
| `warranty_end` | DATE | | Warranty end date | NO |
| `invoice_date` | DATE | | Invoice/purchase date | NO |
| `asset_age_group` | ENUM | | Young \| Mature \| Old | NO |
| `fda_status` | ENUM | | Not_Enrolled \| Enrolled \| Approved | NO |
| `fda_approved_no` | VARCHAR(50) | | Thailand FDA approval number | NO |
| `service_contract_id` | UUID | FK → service_contracts | Linked service contract | NO |
| `total_repair_count` | INT | | Cumulative number of repair jobs | NO |
| `total_repair_amount_thb` | DECIMAL(12,2) | | Total FOB repair cost in Thai Baht | NO |
| `last_pm_date` | DATE | | Last preventive maintenance date | NO |
| `annual_inspection_status` | ENUM | | 1_Target \| 2_Scheduled \| 3_Completed \| 4_Not_Target | NO |
| `condition_grade` | ENUM | | New \| Good \| Needs_Service \| Defective | NO |
| `is_active` | BOOLEAN | | Soft delete flag | YES |
| `created_at` | TIMESTAMP | | Record creation timestamp | YES |
| `updated_at` | TIMESTAMP | | Last update timestamp | YES |

#### Sales Request — `sales_requests`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `request_id` | UUID | PK | System-generated UUID | YES |
| `request_number` | VARCHAR(20) | UNIQUE | Auto-number: DR-YYYY-NNNNNN (e.g., DR-2602-106504) | YES |
| `sfdc_request_id` | VARCHAR(20) | | Salesforce Demo_Loaner_Request__c record ID | NO |
| `record_type` | ENUM | | First_Request \| Extension_Request | YES |
| `status` | ENUM | | See status ENUM table below | YES |
| `purpose1` | ENUM | | Repair \| Sales \| Marketing \| QARA \| Others | YES |
| `purpose2` | ENUM | | Normal_Repair_Loaner \| Q3S_Loaner \| GI3_Loaner \| Service_Contract_Loaner \| Demonstration \| VPP_CPP_Rental \| Operating_Lease \| Workshop | YES |
| `account_id` | UUID | FK → accounts | Requesting hospital account | YES |
| `department_category` | VARCHAR(200) | | Hospital department category | NO |
| `department_name` | VARCHAR(200) | | Specific department | NO |
| `customer_address` | TEXT | | Full delivery address | NO |
| `customer_pic_id` | UUID | FK → users | Customer person in charge | NO |
| `sales_person_id` | UUID | FK → users | Assigned Sales / FSE user | YES |
| `request_date` | DATE | | Date request was submitted | YES |
| `start_use_date` | DATE | | Requested start date for equipment use | YES |
| `estimate_return_date` | DATE | | Requested return date | YES |
| `actual_return_date` | DATE | | Actual return date (set on return) | NO |
| `repair_case_id` | UUID | FK → repair_cases | Linked repair case (repair-triggered loaners) | NO |
| `parent_request_id` | UUID | FK → sales_requests | For extension requests: links to original | NO |
| `internal_so_number` | VARCHAR(50) | | SAP sales order reference | NO |
| `pr_number` | VARCHAR(50) | | Purchase request number | NO |
| `event_name` | VARCHAR(200) | | Associated medical event or conference | NO |
| `prospect_name` | VARCHAR(200) | | Prospect account name | NO |
| `pcl_number` | VARCHAR(50) | | Product Code List reference | NO |
| `total_loan_period_days` | INT | COMPUTED | actual_return_date - start_use_date | NO |
| `extension_count` | INT DEFAULT 0 | | Number of approved extensions | NO |
| `approved_by_id` | UUID | FK → users | User who approved the request | NO |
| `approved_at` | TIMESTAMP | | Approval timestamp | NO |
| `rejection_reason` | TEXT | | Reason if rejected | NO |
| `bom_set_id` | UUID | FK → bom_sets | BOM set used for picking (Demo only) | NO |
| `dispatch_doc_id` | UUID | FK → dispatch_documents | Associated transport document | NO |
| `inspection_record_id` | UUID | FK → inspection_records | Return inspection record | NO |
| `created_by_id` | UUID | FK → users | User who created the request | YES |
| `created_at` | TIMESTAMP | | Record creation timestamp | YES |
| `updated_at` | TIMESTAMP | | Last update timestamp | YES |

#### Request Extension — `request_extensions`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `extension_id` | UUID | PK | Primary key | YES |
| `parent_request_id` | UUID | FK → sales_requests | Parent sales request | YES |
| `new_return_date` | DATE | | Requested new return date | YES |
| `reason_code` | VARCHAR(50) | | Extension reason code | YES |
| `reason_text` | TEXT | | Detailed reason for extension | NO |
| `status` | ENUM | | Waiting_Approval \| Approved \| Rejected | YES |
| `approved_by_id` | UUID | FK → users | Manager who approved/rejected | NO |
| `created_at` | TIMESTAMP | | Creation timestamp | YES |

#### BOM Set — `bom_sets`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `set_id` | UUID | PK | Primary key | YES |
| `set_name` | VARCHAR(50) | UNIQUE | e.g., Set A, Set B, Set C, Set D | YES |
| `model_code` | VARCHAR(50) | | Applicable device model code | YES |
| `version` | VARCHAR(10) | | Version string (e.g., v1.2) | YES |
| `effective_date` | DATE | | Date this version became active | YES |
| `expiry_date` | DATE | | Date this version expires (NULL = current) | NO |
| `is_active` | BOOLEAN | | Active set flag | YES |
| `description` | TEXT | | Set description and usage notes | NO |
| `created_by_id` | UUID | FK → users | User who created/modified the set | YES |
| `created_at` | TIMESTAMP | | Creation timestamp | YES |

#### BOM Line Item — `bom_line_items`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `line_id` | UUID | PK | Primary key | YES |
| `set_id` | UUID | FK → bom_sets | Parent BOM set | YES |
| `accessory_id` | UUID | FK → accessory_master | Accessory master record | YES |
| `sequence_no` | INT | | Display order within the set | NO |
| `quantity_required` | INT | | Expected quantity of this accessory | YES |
| `is_required` | BOOLEAN | | **True = dispatch blocked if missing** | YES |
| `is_optional` | BOOLEAN | | Optional item — warning only if missing | YES |
| `is_consumable` | BOOLEAN | | Single-use — no return expected | YES |
| `storage_location` | VARCHAR(100) | | Warehouse location for picking | NO |

#### Accessory Master — `accessory_master`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `accessory_id` | UUID | PK | Primary key | YES |
| `accessory_code` | VARCHAR(50) | UNIQUE | e.g., MAJ-1435 | YES |
| `accessory_name` | VARCHAR(200) | | e.g., Water Supply Tube | YES |
| `device_model_code` | VARCHAR(50) | | Compatible device model code | NO |
| `is_active` | BOOLEAN | | Active in catalog flag | YES |
| `created_at` | TIMESTAMP | | Creation timestamp | YES |

#### Device Deployment — `device_deployments`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `deployment_id` | UUID | PK | Primary key | YES |
| `request_id` | UUID | FK → sales_requests | Linked sales request | YES |
| `asset_id` | UUID | FK → assets | Deployed equipment asset | YES |
| `deployment_type` | ENUM | | Demo \| Loaner \| Rental \| Operating_Lease | YES |
| `status` | ENUM | | Preparing \| Dispatched \| With_Customer \| Returned \| In_Inspection \| In_Repair | YES |
| `start_date` | DATE | | Actual dispatch date | YES |
| `expected_return_date` | DATE | | Expected return date (updated on extension) | YES |
| `actual_return_date` | DATE | | Actual return date | NO |
| `days_outstanding` | INT | COMPUTED | TODAY - expected_return_date (overdue calc) | NO |
| `condition_on_dispatch` | ENUM | | New \| Good \| Needs_Service | NO |
| `condition_on_return` | ENUM | | Good \| Needs_Cleaning \| Defective \| Missing | NO |
| `is_billable` | BOOLEAN | | Whether rental billing applies | NO |
| `rental_rate_thb` | DECIMAL(10,2) | | Daily rental rate if billable | NO |
| `billing_cycle` | ENUM | | Daily \| Weekly \| Monthly | NO |
| `responsible_eqc_id` | UUID | FK → users | EQC operator responsible | NO |
| `created_at` | TIMESTAMP | | Creation timestamp | YES |
| `updated_at` | TIMESTAMP | | Last update timestamp | YES |

#### Dispatch Document — `dispatch_documents`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `doc_id` | UUID | PK | Primary key | YES |
| `deployment_id` | UUID | FK → device_deployments | Associated deployment | YES |
| `document_type` | ENUM | | First_Request \| Extension \| Item_List \| Return_Receipt | YES |
| `pdf_blob_url` | VARCHAR(500) | | Azure Blob Storage URL for the PDF | NO |
| `qr_code_value` | VARCHAR(200) | | QR code data (links to deployment in WebApp) | NO |
| `qr_code_image_url` | VARCHAR(500) | | Blob URL for QR code image | NO |
| `generated_by_id` | UUID | FK → users | EQC user who triggered generation | YES |
| `generated_at` | TIMESTAMP | | PDF generation timestamp | YES |
| `printer_sent_at` | TIMESTAMP | | Time sent to warehouse printer | NO |
| `signed_copy_url` | VARCHAR(500) | | Blob URL for uploaded signed copy | NO |
| `signed_by_name` | VARCHAR(100) | | Warehouse staff who signed (free text) | NO |
| `signed_at` | TIMESTAMP | | Signature timestamp | NO |
| `status` | ENUM | | Generated \| Sent_to_Print \| Signed \| Uploaded \| Archived | YES |
| `sap_gi_triggered` | BOOLEAN | DEFAULT false | SAP Goods Issue triggered on upload | NO |
| `sap_gi_triggered_at` | TIMESTAMP | | SAP GI trigger timestamp | NO |

#### Inspection Record — `inspection_records`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `inspection_id` | UUID | PK | Primary key | YES |
| `deployment_id` | UUID | FK → device_deployments | Associated deployment | YES |
| `overall_condition` | ENUM | | Good \| Needs_Cleaning \| Defective \| Missing | NO |
| `notes` | TEXT | | Inspector notes | NO |
| `inspected_by_id` | UUID | FK → users | EQC operator who performed inspection | YES |
| `inspected_at` | TIMESTAMP | | Inspection completion timestamp | YES |
| `repair_case_id` | UUID | FK → repair_cases | Auto-created repair case if defect found | NO |
| `created_at` | TIMESTAMP | | Record creation timestamp | YES |

#### Inspection Line Item — `inspection_line_items`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `item_id` | UUID | PK | Primary key | YES |
| `inspection_id` | UUID | FK → inspection_records | Parent inspection record | YES |
| `bom_line_id` | UUID | FK → bom_line_items | BOM line item being inspected | YES |
| `result` | ENUM | | **Pass \| Fail \| Missing** | YES |
| `quantity_actual` | INT | | Actual quantity returned | NO |
| `notes` | TEXT | | Notes on this specific item | NO |
| `inspection_type` | ENUM | | DISPATCH \| RETURN | YES |

#### Repair Case — `repair_cases`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `repair_id` | UUID | PK | Primary key | YES |
| `rs_number` | VARCHAR(30) | UNIQUE | e.g., RS-202602-099595 | YES |
| `eas_no` | VARCHAR(20) | | EAS system number | NO |
| `asset_id` | UUID | FK → assets | Asset under repair | YES |
| `account_id` | UUID | FK → accounts | Hospital where repair is based | YES |
| `sfdc_repair_id` | VARCHAR(20) | | Salesforce Repair__c record ID | NO |
| `status` | ENUM | | Quoted \| IQ_Quoted \| PO_Received \| Parts_Arranged \| Confirmed \| Completed | YES |
| `repair_type` | ENUM | | Normal_Repair \| Q3S_Repair \| GI_Repair \| Service_Contract | YES |
| `area` | VARCHAR(20) | | CENTRAL \| EAST \| NORTH \| SOUTH \| LAOS | NO |
| `repair_cost_thb` | DECIMAL(12,2) | | Total repair cost in Thai Baht | NO |
| `fse_assigned_id` | UUID | FK → users | Assigned FSE for repair | NO |
| `created_at` | TIMESTAMP | | Record creation timestamp | YES |

#### Account (Hospital) — `accounts`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `account_id` | UUID | PK | Primary key | YES |
| `account_name` | VARCHAR(200) | | Hospital / organization name | YES |
| `address` | TEXT | | Full address | NO |
| `area` | VARCHAR(20) | | CENTRAL \| EAST \| NORTH \| SOUTH \| LAOS | NO |
| `department` | VARCHAR(200) | | Primary department | NO |
| `segmentation` | VARCHAR(100) | | Hospital segmentation group | NO |
| `group_wave` | VARCHAR(100) | | SFDC group/wave classification | NO |
| `created_at` | TIMESTAMP | | Record creation timestamp | YES |

#### Event Log — `event_log` (immutable)

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `log_id` | UUID | PK | Primary key — immutable | YES |
| `entity_type` | ENUM | | asset \| sales_request \| deployment \| dispatch_doc \| inspection \| repair_case \| bom_set | YES |
| `entity_id` | UUID | | Record ID of the affected entity | YES |
| `event_type` | VARCHAR(100) | | STATUS_CHANGE \| FIELD_UPDATE \| APPROVAL \| EXTENSION \| DISPATCH \| RETURN | YES |
| `old_value` | TEXT | | Previous value (JSON for complex changes) | NO |
| `new_value` | TEXT | | New value (JSON for complex changes) | NO |
| `actor_id` | UUID | FK → users | User who caused the event (NULL = system/AI) | NO |
| `actor_type` | ENUM | | User \| System \| AI_Agent \| Integration | YES |
| `timestamp` | TIMESTAMP | | Event timestamp — UTC | YES |
| `narrative` | TEXT | | Human-readable: "[User] changed status from X → Y on [Date]" | YES |
| `ip_address` | VARCHAR(50) | | Client IP for security audit | NO |
| `session_id` | VARCHAR(100) | | User session identifier | NO |

#### Teams Alert Log — `teams_alert_log`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `alert_id` | UUID | PK | Primary key | YES |
| `alert_type` | VARCHAR(100) | | e.g., OVERDUE, DISPATCH_UNSIGNED, LOW_INVENTORY | YES |
| `channel` | VARCHAR(100) | | Teams channel (e.g., #demo-alerts) | YES |
| `payload` | TEXT | | Adaptive card JSON payload | NO |
| `delivery_status` | ENUM | | Sent \| Delivered \| Failed \| Retry | YES |
| `message_id` | VARCHAR(100) | | Teams message ID | NO |
| `created_at` | TIMESTAMP | | Alert creation timestamp | YES |

#### Users — `users`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `user_id` | UUID | PK | Primary key | YES |
| `name` | VARCHAR(200) | | Full name | YES |
| `email` | VARCHAR(200) | UNIQUE | Corporate email address | YES |
| `role` | ENUM | | Sales_Rep \| FSE \| EQC_Operator \| EQC_Manager \| Sales_Manager \| Executive \| System_Admin \| Integration_Service | YES |
| `team` | VARCHAR(100) | | Team assignment | NO |
| `area` | VARCHAR(50) | | CENTRAL \| EAST \| NORTH \| SOUTH \| LAOS | NO |
| `sfdc_user_id` | VARCHAR(20) | | Salesforce user ID (SFDC is master for user data) | NO |
| `is_active` | BOOLEAN | | Active user flag | YES |

#### Service Contract — `service_contracts`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `contract_id` | UUID | PK | Primary key | YES |
| `contract_number` | VARCHAR(50) | UNIQUE | Contract reference number | YES |
| `asset_id` | UUID | FK → assets | Asset covered by this contract | YES |
| `contract_type` | VARCHAR(100) | | Maintenance \| Warranty \| Comprehensive | YES |
| `start_date` | DATE | | Contract start date | YES |
| `end_date` | DATE | | Contract end date | YES |

#### AI Prediction Log — `ai_prediction_log`

| Field | Type | Key | Description | Required |
|-------|------|-----|-------------|----------|
| `prediction_id` | UUID | PK | Primary key | YES |
| `prediction_type` | VARCHAR(100) | | OVERDUE_FORECAST \| ANOMALY_DETECTION \| AUDIT_NARRATION | YES |
| `entity_id` | UUID | | Referenced entity ID | YES |
| `entity_type` | VARCHAR(50) | | Entity type (asset/deployment/request) | YES |
| `prediction_output` | TEXT | | AI prediction result / suggested action | YES |
| `confidence_score` | DECIMAL(5,4) | | Confidence score 0.0000–1.0000 | NO |

---

### 4.3 ENUM / Status Value Reference

| Object | Field | Allowed Values |
|--------|-------|----------------|
| Asset | `status` | `Available` \| `Requested` \| `Preparing` \| `BOM_Confirmed` \| `Dispatched` \| `In_Transit` \| `With_Customer` \| `Return_Initiated` \| `In_Inspection` \| `Cleaning` \| `Under_Repair` \| `Quarantine` \| `Extension_Used` \| `Overdue` \| `Retired` |
| Asset | `demo_loaner_type` | `Demo_Asset` \| `Loaner_Asset` \| `MBA_Asset` \| `Service_Center` \| `Rental` \| `Operating_Lease` \| `Workshop` \| `MKTS` \| `Comprehensive_Contract` |
| Asset | `asset_age_group` | `Young` \| `Mature` \| `Old` |
| Asset | `fda_status` | `Not_Enrolled` \| `Enrolled` \| `Approved` |
| Asset | `annual_inspection_status` | `1_Target` \| `2_Scheduled` \| `3_Completed` \| `4_Not_Target` |
| Asset | `condition_grade` | `New` \| `Good` \| `Needs_Service` \| `Defective` |
| Sales Request | `record_type` | `First_Request` \| `Extension_Request` |
| Sales Request | `status` | `Draft` \| `Waiting_Approval` \| `Waiting_Reservation` \| `Preparing` \| `BOM_Confirmed` \| `Ready_for_Dispatch` \| `Dispatched` \| `With_Customer` \| `Return_Initiated` \| `Request_Complete` \| `Cancelled` |
| Sales Request | `purpose1` | `Repair` \| `Sales` \| `Marketing` \| `QARA` \| `Others` |
| Sales Request | `purpose2` | `Normal_Repair_Loaner` \| `Q3S_Loaner` \| `GI3_Loaner` \| `Service_Contract_Loaner` \| `Demonstration` \| `VPP_CPP_Rental` \| `Operating_Lease` \| `Workshop` |
| Request Extension | `status` | `Waiting_Approval` \| `Approved` \| `Rejected` |
| Device Deployment | `deployment_type` | `Demo` \| `Loaner` \| `Rental` \| `Operating_Lease` |
| Device Deployment | `status` | `Preparing` \| `Dispatched` \| `With_Customer` \| `Returned` \| `In_Inspection` \| `In_Repair` |
| Device Deployment | `condition_on_dispatch` | `New` \| `Good` \| `Needs_Service` |
| Device Deployment | `condition_on_return` | `Good` \| `Needs_Cleaning` \| `Defective` \| `Missing` |
| Device Deployment | `billing_cycle` | `Daily` \| `Weekly` \| `Monthly` |
| Dispatch Document | `document_type` | `First_Request` \| `Extension` \| `Item_List` \| `Return_Receipt` |
| Dispatch Document | `status` | `Generated` \| `Sent_to_Print` \| `Signed` \| `Uploaded` \| `Archived` |
| Inspection Line Item | `result` | `Pass` \| `Fail` \| `Missing` |
| Inspection Line Item | `inspection_type` | `DISPATCH` \| `RETURN` |
| Repair Case | `status` | `Quoted` \| `IQ_Quoted` \| `PO_Received` \| `Parts_Arranged` \| `Confirmed` \| `Completed` |
| Repair Case | `repair_type` | `Normal_Repair` \| `Q3S_Repair` \| `GI_Repair` \| `Service_Contract` |
| Event Log | `entity_type` | `asset` \| `sales_request` \| `deployment` \| `dispatch_doc` \| `inspection` \| `repair_case` \| `bom_set` |
| Event Log | `actor_type` | `User` \| `System` \| `AI_Agent` \| `Integration` |
| Teams Alert Log | `delivery_status` | `Sent` \| `Delivered` \| `Failed` \| `Retry` |
| Users | `role` | `Sales_Rep` \| `FSE` \| `EQC_Operator` \| `EQC_Manager` \| `Sales_Manager` \| `Executive` \| `System_Admin` \| `Integration_Service` |
| AI Prediction Log | `prediction_type` | `OVERDUE_FORECAST` \| `ANOMALY_DETECTION` \| `AUDIT_NARRATION` |

---

### 4.4 Object Relationships

| # | From | Cardinality | To | Join Key | Notes |
|---|------|-------------|-----|----------|-------|
| 1 | Sales Request | Many → One | Account (Hospital) | `account_id` | Each request belongs to one hospital |
| 2 | Sales Request | Many → One | Users (Sales Person) | `sales_person_id` | Assigned FSE / Sales rep |
| 3 | Sales Request | Many → One | Repair Case | `repair_case_id` | Repair-triggered loaners link to repair |
| 4 | Sales Request | Many → One (self) | Sales Request (parent) | `parent_request_id` | Extension request hierarchy |
| 5 | Device Deployment | Many → One | Sales Request | `request_id` | One request can deploy multiple assets |
| 6 | Device Deployment | Many → One | Asset (Equipment) | `asset_id` | Each deployment is one physical asset |
| 7 | Asset (Equipment) | Many → One | Account (Hospital) | `account_id` | Asset currently at or owned by hospital |
| 8 | Asset (Equipment) | One → Many | Device Deployment | `asset_id` | Asset has full deployment history |
| 9 | Asset (Equipment) | One → Many | Repair Case | `asset_id` | Asset has multiple repair histories |
| 10 | Repair Case | Many → One | Asset (Equipment) | `asset_id` | Each repair is for one asset |
| 11 | Repair Case | Many → One | Account (Hospital) | `account_id` | Repair at hospital site |
| 12 | BOM Set | One → Many | BOM Line Item | `set_id` | Set contains multiple accessory lines |
| 13 | BOM Line Item | Many → One | Accessory Master | `accessory_id` | Line references master accessory |
| 14 | Sales Request | One → One | Dispatch Document | `dispatch_doc_id` | Request has one transport document |
| 15 | Sales Request | One → One | Inspection Record | `inspection_record_id` | Request has one return inspection |
| 16 | Inspection Record | One → Many | Inspection Line Item | `inspection_id` | Inspection has per-item results |
| 17 | Event Log | Many → One (polymorphic) | Any Entity | `entity_id` + `entity_type` | Audit trail for all entities |
| 18 | Asset (Equipment) | Many → One | Service Contract | `service_contract_id` | Asset covered by service contract |
| 19 | Request Extension | Many → One | Sales Request | `parent_request_id` | Extension links to parent request |
| 20 | Teams Alert Log | Linked to | Any Entity | `alert_type` + entity context | Alert log for Teams notifications |

---

## 5. Authentication — Azure AD MSAL Integration

This section provides the complete, step-by-step MSAL integration required for the frontend. All steps below are mandatory. The `UserRole` values used throughout MSAL config and JWT claims match the `users.role` ENUM defined in Section 4.

### Step 1: Install MSAL Packages

```bash
npm install @azure/msal-browser @azure/msal-react
```

### Step 2: Create Authentication Config

Create `src/authConfig.ts`:

```typescript
import type { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_AD_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI, // e.g. http://localhost:5173
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Scope targets the backend App Registration's exposed API permission
export const loginRequest: PopupRequest = {
  scopes: [`api://${import.meta.env.VITE_BACKEND_CLIENT_ID}/access_as_user`],
};
```

### Step 3: Wrap App with MSAL Provider

In `src/main.tsx`:

```typescript
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "@/authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

// Initialize before rendering (required for redirect flows)
await msalInstance.initialize();

root.render(
  <MsalProvider instance={msalInstance}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </MsalProvider>
);
```

### Step 4: Login Button

In `src/pages/Login/LoginPage.tsx`:

```typescript
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/authConfig";

function LoginPage() {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
      // After successful MSAL login, AuthContext calls GET /api/auth/me
      // to fetch backend user profile (id, role, name)
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <img src="/olympus-logo.svg" alt="Olympus" className="h-16 mx-auto" />
        <h1 className="text-2xl font-semibold">EQC Asset Management</h1>
        <button
          onClick={handleLogin}
          className="btn-primary px-8 py-3 rounded-lg"
        >
          Sign in with Olympus AD
        </button>
      </div>
    </div>
  );
}
```

### Step 5: Acquire JWT Token and Send to Backend

In `src/api/axiosInstance.ts`:

```typescript
import axios from "axios";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "@/authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach Bearer token to every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) throw new Error("No active account");

    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });

    config.headers.Authorization = `Bearer ${response.accessToken}`;
  } catch {
    // Token silent acquisition failed — trigger interactive login
    await msalInstance.acquireTokenPopup(loginRequest);
  }
  return config;
});

// Normalize error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = error.response?.data?.error ?? {
      code: "NETWORK_ERROR",
      message: "A network error occurred",
    };
    return Promise.reject(apiError);
  }
);
```

### Step 6: Auth Flow on Application Load

When the app loads, `AuthContext` checks MSAL for an active account. If found, it calls `GET /api/auth/me` with the silently acquired token to fetch the backend's user record (including `role`). This role is then used for all RBAC decisions throughout the app. If no MSAL account is found, the user is redirected to `/login`.

---

## 6. Routing & Role-Based Access Control

All role names in this section correspond directly to the `users.role` ENUM values defined in Section 4.2. The frontend never hardcodes role strings — always import from `src/types/enums.ts`.

### 6.1 Route Table

Role names map directly to the `users.role` ENUM values: `Sales_Rep`, `FSE`, `EQC_Operator`, `EQC_Manager`, `Sales_Manager`, `Executive`, `System_Admin`.

| Path | Component | Allowed Roles | Notes |
|------|-----------|---------------|-------|
| `/login` | `LoginPage` | Public | Redirects to `/dashboard` if already authenticated |
| `/` | Redirect | All | Redirects to `/dashboard` |
| `/dashboard` | `RoleRedirect` | All | Redirects to role-specific dashboard sub-route |
| `/dashboard/sales` | `SalesDashboard` | Sales_Rep, FSE, Sales_Manager, System_Admin | Sales-specific KPIs and request pipeline |
| `/dashboard/eqc` | `EQCDashboard` | EQC_Operator, EQC_Manager, System_Admin | EQC ops action queue |
| `/dashboard/manager` | `ManagerDashboard` | EQC_Manager, Sales_Manager, System_Admin | Overdue feed + approval queue |
| `/dashboard/inventory` | `InventoryDashboard` | EQC_Operator, EQC_Manager, Sales_Manager, System_Admin | Asset inventory and warehouse view |
| `/dashboard/executive` | `ExecutiveDashboard` | Executive, Sales_Manager, EQC_Manager, System_Admin | KPI trends, AI narrative |
| `/dashboard/finance` | `FinanceDashboard` | Sales_Manager, EQC_Manager, Executive, System_Admin | Billing, rental revenue, repair costs |
| `/sales-requests` | `SalesRequestListPage` | All | Role-filtered: Sales_Rep/FSE see own requests; managers see all |
| `/sales-requests/new` | `CreateSalesRequestPage` | Sales_Rep, FSE, EQC_Operator, EQC_Manager, Sales_Manager, System_Admin | Create First_Request or Extension_Request |
| `/sales-requests/:request_id` | `SalesRequestDetailPage` | All | Full detail with event log timeline |
| `/assets` | `AssetListPage` | All | Role-filtered actions: only EQC/Admin can transition status |
| `/assets/new` | `CreateAssetPage` | System_Admin | Admin only |
| `/assets/:asset_id` | `AssetDetailPage` | All | Deployment history, repair history, contract info |
| `/bom` | `BOMSetsPage` | EQC_Operator, EQC_Manager, System_Admin | BOM set list by model code |
| `/bom/:set_id` | `BOMSetDetailPage` | EQC_Operator, EQC_Manager, System_Admin | Line items with accessory codes |
| `/bom/packing/:request_id` | `BOMPackingPage` | EQC_Operator, EQC_Manager, System_Admin | Packing checklist; blocks dispatch if is_required items missing |
| `/dispatch` | `DispatchListPage` | EQC_Operator, EQC_Manager, System_Admin | All dispatch docs with status filter |
| `/dispatch/generate` | `GenerateDispatchPage` | EQC_Operator, EQC_Manager, System_Admin | Wizard to generate transport doc |
| `/dispatch/:doc_id` | `DispatchDocumentPage` | EQC_Operator, EQC_Manager, System_Admin | PDF link, sign copy upload |
| `/inspections` | `InspectionListPage` | EQC_Operator, EQC_Manager, System_Admin | |
| `/inspections/new` | `CreateInspectionPage` | EQC_Operator, EQC_Manager, System_Admin | |
| `/inspections/:inspection_id` | `InspectionDetailPage` | EQC_Operator, EQC_Manager, System_Admin | Per-line-item Pass/Fail/Missing form |
| `/repair-cases` | `RepairCaseListPage` | FSE, EQC_Operator, EQC_Manager, Sales_Manager, System_Admin | |
| `/repair-cases/:repair_id` | `RepairCaseDetailPage` | FSE, EQC_Operator, EQC_Manager, Sales_Manager, System_Admin | |
| `/reports` | `ReportsListPage` | All | Role-filtered report type cards |
| `/reports/:type` | `ReportDetailPage` | Role-dependent per report type | |
| `/accounts` | `AccountListPage` | Sales_Rep, FSE, EQC_Manager, Sales_Manager, System_Admin | |
| `/accounts/:account_id` | `AccountDetailPage` | Sales_Rep, FSE, EQC_Manager, Sales_Manager, System_Admin | |
| `/users` | `UserListPage` | System_Admin | |
| `/audit` | `AuditLogPage` | EQC_Manager, Sales_Manager, Executive, System_Admin | Event log viewer |
| `*` | `NotFoundPage` | All | |

### 6.2 ProtectedRoute Implementation

```typescript
// src/router/ProtectedRoute.tsx
import { useIsAuthenticated } from "@azure/msal-react";
import { Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import UnauthorizedPage from "@/pages/Unauthorized/UnauthorizedPage";

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  const { user } = useCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
}
```

### 6.3 RoleGuard Component

For inline role-based rendering (hide/show buttons, sections):

```typescript
// src/components/forms/RoleGuard.tsx
export function RoleGuard({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { user } = useCurrentUser();
  if (!user || !roles.includes(user.role)) return null;
  return <>{children}</>;
}

// Usage example:
<RoleGuard roles={["MANAGER", "ADMIN"]}>
  <Button onClick={approve}>Approve</Button>
</RoleGuard>
```

---

## 7. API Integration Layer

### 7.1 Request/Response Pattern

All API calls follow this pattern:
- Request: Axios instance with Bearer token interceptor (see Section 4, Step 5)
- Success response shape: `{ success: true, data: T, meta?: PaginationMeta }`
- Error response shape: `{ success: false, error: { code: string, message: string, details?: any } }`

### 7.2 Error Handling Strategy

| HTTP Status | Error Code | Frontend Behavior |
|-------------|-----------|------------------|
| 400 | `VALIDATION_ERROR` | Display field-level errors from `details` on form fields |
| 401 | `UNAUTHORIZED` / `TOKEN_EXPIRED` | Silently re-acquire token via MSAL; redirect to login if fails |
| 403 | `INSUFFICIENT_PERMISSIONS` | Show `UnauthorizedPage` or inline "You don't have permission" message |
| 404 | `NOT_FOUND` | Show "Record not found" inline or redirect to list page |
| 409 | `BOOKING_CONFLICT` | Show conflict message with conflicting deployment details |
| 409 | `DISPATCH_BLOCKED` | Show prominent red alert listing `details.missingItems` array |
| 500 | `INTERNAL_ERROR` | Show generic error toast; log to console |
| Network error | `NETWORK_ERROR` | Show "Check your connection" toast |

### 7.3 Optimistic Updates Policy

- **Never optimistic:** Status transitions (approve, dispatch, inspect, BOM validate). Always wait for server confirmation.
- **Optimistic where safe:** Adding a note or non-critical metadata update — immediately reflect in UI, rollback on error.

### 7.4 Cache Invalidation

TanStack Query cache keys follow this pattern: `['assets', filters]`, `['deployment', id]`, `['dashboard', 'sales']`. Mutations invalidate all related query keys. Example: approving a deployment invalidates `['deployments']` and `['dashboard', 'eqc']` and `['dashboard', 'manager']`.

---

## 8. State Management

The frontend uses a two-tier state model:

**Server State — TanStack Query**  
All data that comes from the API (assets, deployments, BOM, dashboards) is server state managed exclusively by TanStack Query. This provides caching, background refresh, loading/error states, and cache invalidation. Never duplicate API data into a global store.

**Client/UI State — React State + Context**  
- `AuthContext` — authenticated user object (persists through page navigations, cleared on logout)
- `ThemeContext` — light/dark mode preference
- Page-local state — filter values, selected rows, modal open/close, form dirty state — all managed with `useState` or `useReducer` within the relevant component

There is no global state management library (no Redux, no Zustand). If a future feature requires truly global client state beyond auth and theme, Zustand can be added at that point without restructuring existing code.

---

## 9. Pages & Feature Modules

### 9.1 Navigation Structure (Sidebar)

The sidebar renders navigation items based on `user.role`. Items not accessible to the current role are hidden entirely (not disabled):

| Nav Item | Icon | Roles |
|----------|------|-------|
| Dashboard | LayoutDashboard | All |
| Sales Requests | ClipboardList | All |
| Assets | Package | All (EQC_Operator / managers / System_Admin for status transitions) |
| BOM & Packing | BoxSelect | EQC_Operator, EQC_Manager, System_Admin |
| Dispatch | Truck | EQC_Operator, EQC_Manager, System_Admin |
| Inspections | ClipboardCheck | EQC_Operator, EQC_Manager, System_Admin |
| Repair Cases | Wrench | FSE, EQC_Operator, EQC_Manager, Sales_Manager, System_Admin |
| Reports | BarChart2 | All |
| Accounts | Building2 | Sales_Rep, FSE, EQC_Manager, Sales_Manager, System_Admin |
| Users | Users | System_Admin |
| Audit Log | ScrollText | EQC_Manager, Sales_Manager, Executive, System_Admin |

### 9.2 Sales Request Lifecycle UI

The `SalesRequestDetailPage` renders a vertical status timeline component (`<StatusTimeline />`) showing the request's full lifecycle. Status values are sourced from `sales_requests.status` and rendered in order: `Draft → Waiting_Approval → Waiting_Reservation → Preparing → BOM_Confirmed → Ready_for_Dispatch → Dispatched → With_Customer → Return_Initiated → Request_Complete`. Each node shows the `event_log.narrative` text, `timestamp`, and `actor_type` for that transition. The current status is highlighted. The timeline also includes `device_deployments.status` transitions shown as sub-nodes under the parent request.

Action buttons rendered per role and current `sales_requests.status`:

| Action | Component | Roles | Condition |
|--------|-----------|-------|-----------|
| Approve | Button (green) | EQC_Manager, Sales_Manager, System_Admin | status = `Waiting_Approval` |
| Reject | Button (red) + reason field | EQC_Manager, Sales_Manager, System_Admin | status = `Waiting_Approval` |
| Prepare BOM | Link to `/bom/packing/:request_id` | EQC_Operator, EQC_Manager, System_Admin | status = `Preparing` |
| Confirm BOM | Button | EQC_Operator, EQC_Manager, System_Admin | status = `Preparing`, packing validated |
| Generate Dispatch | Link to `/dispatch/generate` | EQC_Operator, EQC_Manager, System_Admin | status = `BOM_Confirmed` |
| Mark Dispatched | (auto on doc generation) | — | Triggered by dispatch document creation |
| Mark Return Initiated | Button | EQC_Operator, EQC_Manager, System_Admin | status = `With_Customer` |
| Start Inspection | Link to `/inspections/new` | EQC_Operator, EQC_Manager, System_Admin | status = `Return_Initiated` |
| Request Extension | Button (opens modal) | Sales_Rep, FSE, Sales_Manager | status = `With_Customer` or `Dispatched` |
| Cancel Request | Button (red, confirm dialog) | EQC_Manager, Sales_Manager, System_Admin | status = `Draft` or `Waiting_Approval` |

### 9.3 BOM Packing Page UI

This is the most operationally critical UI in the application. Renders a checklist of BOM components from the frozen snapshot. For each row: component name, SAP material code, required quantity, item type (REQUIRED/OPTIONAL), and a checkbox. "REQUIRED" items have a red asterisk. If the operator tries to click "Generate Dispatch Document" without validating packing, the button triggers `validatePacking()`. If the server returns `{ isComplete: false, missingItems: [...] }`, an alert banner lists all missing items by name. The "Generate Dispatch Document" button remains disabled until `isComplete = true`.

---

## 10. Dashboards — All Six Dashboards

All dashboards auto-refresh every 5 minutes via TanStack Query `refetchInterval`. All KPI numbers are clickable drill-downs navigating to the relevant filtered list page. All dashboards are designed to be displayable on Smart TVs (large font, high contrast, minimal interaction required). Individual HTML layout files for each dashboard will be provided separately during the realization sprint and will be wired into these components.

### 10.1 Sales Dashboard (`/dashboard/sales`)

**Roles:** `Sales_Rep`, `FSE`, `Sales_Manager`, `System_Admin`  
**Backend endpoint:** `GET /api/dashboard/sales`  
**Key fields from schema:** `sales_requests.status`, `sales_requests.purpose2`, `sales_requests.sales_person_id`, `device_deployments.days_outstanding`, `sales_requests.estimate_return_date`

> UI layout to be provided as an HTML file during Sprint 4 and wired to `useSalesDashboard()`.

### 10.2 EQC Dashboard (`/dashboard/eqc`)

**Roles:** `EQC_Operator`, `EQC_Manager`, `System_Admin`  
**Backend endpoint:** `GET /api/dashboard/service`  
**Key fields from schema:** `sales_requests.status`, `dispatch_documents.status`, `device_deployments.status`, `inspection_records.inspection_id`

> UI layout to be provided as an HTML file during Sprint 4 and wired to `useEQCDashboard()`.

### 10.3 Manager Dashboard (`/dashboard/manager`)

**Roles:** `EQC_Manager`, `Sales_Manager`, `System_Admin`  
**Backend endpoint:** `GET /api/dashboard/overdue`  
**Key fields from schema:** `device_deployments.days_outstanding`, `ai_prediction_log.prediction_output`, `request_extensions.status`, `sales_requests.status = Waiting_Approval`

> UI layout to be provided as an HTML file during Sprint 4 and wired to `useEQCDashboard()` (with role-gated manager data).

### 10.4 Inventory Dashboard (`/dashboard/inventory`)

**Roles:** `EQC_Operator`, `EQC_Manager`, `Sales_Manager`, `System_Admin`  
**Backend endpoint:** `GET /api/dashboard/inventory`  
**Key fields from schema:** `assets.status`, `assets.warehouse_code`, `assets.model_code`, `assets.demo_loaner_type`, `assets.condition_grade`, `assets.annual_inspection_status`

> UI layout to be provided as an HTML file during Sprint 4 and wired to `useInventoryDashboard()`.

### 10.5 Executive Dashboard (`/dashboard/executive`)

**Roles:** `Executive`, `Sales_Manager`, `EQC_Manager`, `System_Admin`  
**Backend endpoint:** `GET /api/dashboard/executive`  
**Key fields from schema:** `sales_requests` aggregates, `device_deployments.rental_rate_thb`, `repair_cases.repair_cost_thb`, `ai_prediction_log.prediction_output` (OVERDUE_FORECAST), `event_log` aggregates

> UI layout to be provided as an HTML file during Sprint 4 and wired to `useExecutiveDashboard()`.

### 10.6 Finance Dashboard (`/dashboard/finance`)

**Roles:** `Sales_Manager`, `EQC_Manager`, `Executive`, `System_Admin`  
**Backend endpoint:** `GET /api/dashboard/finance` *(backend endpoint to be implemented alongside this dashboard)*  
**Key fields from schema:** `device_deployments.rental_rate_thb`, `device_deployments.billing_cycle`, `device_deployments.is_billable`, `repair_cases.repair_cost_thb`, `assets.total_repair_amount_thb`

> UI layout to be provided as an HTML file during Sprint 4 and wired to `useFinanceDashboard()`.

---

## 11. Reports Section

The Reports section is a first-class module at `/reports`, accessible to all roles with role-appropriate report types shown. It is not a sub-section of any dashboard — it has its own dedicated navigation item and routing hierarchy.

### 11.1 Report Types

| Report Type | Identifier | Description | Source Tables | Allowed Roles |
|-------------|-----------|-------------|--------------|---------------|
| Sales Request Summary | `SalesRequestSummary` | All `sales_requests` with `request_number`, `status`, `purpose1`, `purpose2`, account, rep, dates, `extension_count`. Filterable by status, purpose1/2, account, date range | `sales_requests`, `accounts`, `users` | All |
| Loaner Billing | `LoanerBilling` | `device_deployments` where `is_billable = true`: asset, `rental_rate_thb`, `billing_cycle`, days deployed, estimated amount | `device_deployments`, `sales_requests`, `assets`, `accounts` | Sales_Manager, EQC_Manager, Executive, System_Admin |
| Inspection Defects | `InspectionDefects` | `inspection_line_items` with `result = Fail OR Missing`, linked `bom_line_id → accessory_name`, linked `repair_cases.rs_number` | `inspection_line_items`, `inspection_records`, `bom_line_items`, `accessory_master`, `repair_cases` | EQC_Operator, EQC_Manager, Sales_Manager, System_Admin |
| Asset Utilization | `AssetUtilization` | Per asset: `total_repair_count`, `total_repair_amount_thb`, deployment count (from `device_deployments`), `condition_grade`, `annual_inspection_status` | `assets`, `device_deployments` | EQC_Manager, Sales_Manager, Executive, System_Admin |
| Overdue Analysis | `OverdueAnalysis` | `device_deployments` where `days_outstanding > 0`: days overdue, account, sales rep, `ai_prediction_log.prediction_output`, Teams alert history | `device_deployments`, `sales_requests`, `accounts`, `users`, `teams_alert_log`, `ai_prediction_log` | EQC_Manager, Sales_Manager, System_Admin |
| BOM Compliance | `BOMCompliance` | `dispatch_documents` cross-referenced against their `bom_line_items`; `inspection_line_items` showing missing items at return | `dispatch_documents`, `bom_line_items`, `accessory_master`, `inspection_line_items` | EQC_Operator, EQC_Manager, System_Admin |
| Repair Case Summary | `RepairCaseSummary` | All `repair_cases` with `rs_number`, asset, account, `status`, `repair_type`, `area`, `repair_cost_thb`, FSE assigned | `repair_cases`, `assets`, `accounts`, `users` | FSE, EQC_Manager, Sales_Manager, Executive, System_Admin |

### 11.2 Reports List Page (`/reports`)

**`src/pages/Reports/ReportsListPage.tsx`**  
Landing page for the reports module. Renders a grid of report type cards. Each card shows: report name, description, source tables, export formats available, last run date (if any). Cards not accessible to the current user's role are hidden. A "Scheduled Reports" tab shows the user's saved/scheduled report configurations.

### 11.3 Report Detail Page (`/reports/:type`)

**`src/pages/Reports/ReportDetailPage.tsx`**  

**Filter Panel (left sidebar or top):**  
- Date range picker (`<DateRangePicker />`) — maps to `created_at`, `request_date`, or `start_use_date` depending on report type
- Status multi-select — values populated from the relevant object's ENUM (e.g., `SalesRequestStatus` for SalesRequestSummary, `RepairCaseStatus` for RepairCaseSummary)
- Account search selector (`<AccountSelector />`) — filters by `account_id`
- Purpose filter (for `SalesRequestSummary`) — `purpose1` and `purpose2` dropdowns populated from ENUM values
- Area filter (CENTRAL / EAST / NORTH / SOUTH / LAOS) — for repair cases and account reports
- Apply and Reset buttons
- Filters persist in URL query string so reports are shareable/bookmarkable

**Data Table (main area):**  
- Uses `<DataTable />` with TanStack Table v8
- Server-side pagination and sorting
- Column visibility toggle — users can show/hide columns
- All columns sortable by clicking header
- Sticky first column for wide tables
- Clicking a row navigates to the relevant detail page (`/sales-requests/:request_id`, `/assets/:asset_id`, `/repair-cases/:repair_id`, etc.)

**Export Bar (top right):**  
- "Export Excel" button — calls `exportReport(type, filters, 'xlsx')` endpoint; backend returns file; client downloads it
- "Export CSV" button — same with `'csv'` format
- "Export PDF" button — same with `'pdf'` format
- "Schedule Report" button (`EQC_Manager`, `Sales_Manager`, `System_Admin`) — opens a modal to configure scheduled delivery

**Summary Row:**  
Above the table, a row of aggregate figures: total records, total `rental_rate_thb` × days (for billing reports), total `repair_cost_thb` (for repair reports). Computed from the current filter result by the backend.

### 11.4 Scheduled Reports Modal

**`src/pages/Reports/ScheduleReportModal.tsx`**  
Form to configure a scheduled report:
- Frequency: Daily / Weekly / Monthly
- Day/time selection
- Recipient email addresses (comma-separated) — backend sends via `email.service.ts`
- Report format (XLSX / PDF / CSV)
- "Save Schedule" calls `POST /api/reports/schedule`. Saved schedules appear in the "Scheduled Reports" tab on `/reports`.

### 11.5 Self-Service Report Builder (Sprint 5 / Future)

As specified in the solution design, a drag-and-drop self-service report builder will be added in a later sprint at `/reports/builder`. The builder will allow column selection from the full schema field set defined in Section 4, grouping, sorting, and saving custom report views per user. Implementation details to be specified when the UI design is provided. The architecture is prepared for this — no existing report pages require modification.

---

## 12. Shared Components Library

### 12.1 Layout Components

**`<Sidebar />`**  
Fixed left navigation. Width: 240px on desktop, collapsible to icon-only (60px) on tablet. Renders nav items filtered by current user role. Active item highlighted. Bottom section: user avatar, name, role badge, logout button.

**`<TopNav />`**  
Fixed top bar. Shows current page title (from route meta), breadcrumb trail, and notification bell (future: Teams alert count). Right side: user avatar dropdown.

**`<PageHeader />`**  
Page-level heading. Props: `title`, `subtitle`, `actions` (right-aligned action buttons slot). Used at the top of every page.

**`<ContentCard />`**  
White card container with shadow and rounded corners. Wraps dashboard sections and form areas. Props: `title`, `subtitle`, `actions`, `children`.

### 12.2 Data Display Components

**`<DataTable />`**  
TanStack Table wrapper. Props: `columns`, `data`, `isLoading`, `pagination`, `onSort`, `onPageChange`. Renders skeleton rows during loading. Empty state via `<EmptyState />` when data is empty. Supports row click navigation.

**`<KPICard />`**  
Dashboard metric card. Props: `label`, `value`, `trend` (positive/negative/neutral), `trendValue`, `icon`, `onClick` (drill-down). Large value text (48px), small label, colored trend arrow.

**`<StatusTimeline />`**  
Vertical timeline of deployment status transitions. Each node shows: status name, timestamp, actor name, notes. Current status node highlighted with ring. Used in `SalesRequestDetailPage`.

**`<AssetStatusBadge />`**  
Colored pill badge for `assets.status`. Color mapping: `Available` → green; `Requested`/`Preparing`/`BOM_Confirmed` → blue; `Dispatched`/`In_Transit`/`With_Customer` → indigo; `Return_Initiated`/`In_Inspection`/`Cleaning` → amber; `Under_Repair`/`Quarantine` → orange; `Extension_Used`/`Overdue` → red; `Retired` → gray.

**`<SalesRequestStatusBadge />`**  
Colored pill for `sales_requests.status`. Color mapping: `Draft` → gray; `Waiting_Approval`/`Waiting_Reservation` → amber; `Preparing`/`BOM_Confirmed` → blue; `Ready_for_Dispatch`/`Dispatched` → indigo; `With_Customer` → green; `Return_Initiated`/`Request_Complete` → teal; `Cancelled` → red.

**`<RepairCaseStatusBadge />`**  
Colored pill for `repair_cases.status`. Color mapping: `Quoted`/`IQ_Quoted` → amber; `PO_Received`/`Parts_Arranged` → blue; `Confirmed` → indigo; `Completed` → green.

**`<DispatchDocStatusBadge />`**  
Colored pill for `dispatch_documents.status`. Color mapping: `Generated` → blue; `Sent_to_Print` → indigo; `Signed`/`Uploaded` → green; `Archived` → gray.

**`<SeverityBadge />`**  
Colored pill for overdue severity derived from `device_deployments.days_outstanding`. 1–3 days → Medium (amber); 4–7 days → High (orange); 8–14 days → Critical (red); >14 days → Urgent (dark red).

### 12.3 Chart Components

All chart components use Recharts and are wrapped to be responsive by default.

**`<BarChart />`** — vertical or horizontal bar chart. Props: `data`, `xKey`, `yKey`, `color`, `onClick`.

**`<LineChart />`** — multi-series line chart. Props: `data`, `series[]{ key, label, color }`, `xKey`.

**`<DonutChart />`** — donut/pie chart. Props: `data[]{ label, value, color }`. Shows center label with total.

**`<TrendBadge />`** — small inline badge showing percentage change. Green arrow up for positive, red arrow down for negative, gray dash for neutral.

### 12.4 Form Components

**`<FormField />`**  
Wraps a label, input/select/textarea, and error message. Integrates with React Hook Form `register`. Shows red error text below on validation failure.

**`<DateRangePicker />`**  
Two-calendar date range selector. Outputs `{ startDate: Date, endDate: Date }`. Used in report filters and deployment creation form.

**`<AccountSelector />`**  
Searchable combobox for account selection. Calls `GET /api/accounts?search=` with debounced input. Renders dropdown of matching accounts.

**`<AssetSelector />`**  
Searchable combobox for asset selection, filtered by `status=AVAILABLE` by default.

### 12.5 Feedback Components

**`<LoadingSpinner />`**  
Centered spinner with optional text. Used during page-level loading states.

**`<ErrorBoundary />`**  
React error boundary wrapping all route components. Catches unexpected render errors. Shows a friendly error card with "Try again" button and error details in development mode.

**`<AlertBanner />`**  
Full-width alert bar. Variants: `error`, `warning`, `info`, `success`. Props: `message`, `details[]`, `onDismiss`. Used for `DISPATCH_BLOCKED` and `BOOKING_CONFLICT` errors — always shows the `details` array prominently.

**`<ConfirmDialog />`**  
Modal confirmation dialog for destructive or irreversible actions (Reject, Deactivate User, etc.). Props: `title`, `description`, `confirmLabel`, `onConfirm`, `isLoading`. The confirm button shows a spinner while the mutation is in flight.

---

## 13. Environment Variable Reference

All environment variables are prefixed with `VITE_` for Vite exposure to the browser bundle. All are validated at startup using a Zod schema in `src/config/env.ts`. The application throws a clear error at build time if any required variable is missing.

| Variable | Description | Example Value |
|----------|-------------|--------------|
| `VITE_AZURE_AD_CLIENT_ID` | Frontend app registration client ID in Azure AD | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `VITE_AZURE_AD_TENANT_ID` | Azure AD tenant ID (Olympus directory) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `VITE_BACKEND_CLIENT_ID` | Backend app registration client ID (for scope construction) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `VITE_REDIRECT_URI` | MSAL redirect URI after login. Must match Azure AD app registration | `http://localhost:5173` (dev), `https://app.eqc.olympus.th` (prod) |
| `VITE_API_BASE_URL` | Backend REST API base URL | `http://localhost:3000` (dev), `https://api.eqc.olympus.th` (prod) |
| `VITE_APP_NAME` | Application display name | `EQC Asset Management` |
| `VITE_APP_VERSION` | Application version (injected by CI/CD) | `1.0.0` |
| `VITE_ENVIRONMENT` | Runtime environment label | `development`, `staging`, `production` |

**`src/config/env.ts`** — Validates and exports all env vars:

```typescript
import { z } from "zod";

const envSchema = z.object({
  VITE_AZURE_AD_CLIENT_ID: z.string().uuid(),
  VITE_AZURE_AD_TENANT_ID: z.string().uuid(),
  VITE_BACKEND_CLIENT_ID: z.string().uuid(),
  VITE_REDIRECT_URI: z.string().url(),
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().default("EQC Asset Management"),
  VITE_ENVIRONMENT: z.enum(["development", "staging", "production"]).default("development"),
});

export const env = envSchema.parse(import.meta.env);
```

---

## 14. Verification Plan

After implementation, verify end-to-end correctness using these 10 steps:

1. **MSAL Login Flow:** Open `/login`. Click "Sign in with Olympus AD". Complete Azure AD login popup. Confirm redirect to `/dashboard`. Confirm `GET /api/auth/me` is called and user object (with role) is stored in `AuthContext`. Confirm the access token in the `Authorization` header matches the MSAL-acquired token.

2. **Silent Token Refresh:** After initial login, wait for the access token to expire (or manually expire it in browser devtools). Make any API call. Confirm `acquireTokenSilent` is triggered automatically and a new token is injected without requiring re-login. No manual token management should be visible to the user.

3. **Role-Based Navigation:** Log in as each of the six roles in turn. Confirm the sidebar renders only the permitted navigation items for each role. Confirm navigating directly to a restricted URL (e.g., `/users` as a SALES user) renders `UnauthorizedPage` rather than the page content.

4. **Dashboard Data Loading:** On each dashboard page, confirm all KPI cards, charts, and tables load correctly. Confirm the 5-minute auto-refresh is active (visible in Network tab as repeated API calls). Confirm clicking a KPI card navigates to the correct filtered list page.

5. **Dispatch Block UI:** Navigate to `/bom/packing/:deploymentId` with an incomplete BOM. Click "Generate Dispatch Document". Confirm the `AlertBanner` renders with variant `error` and displays the `missingItems` list by component name. Confirm the Generate button remains disabled. Tick all required items and validate — confirm the button becomes enabled.

6. **Inspection Flow:** Create an inspection for a returned deployment. Set some items to FAIL. Click "Complete Inspection". Confirm the deployment status transitions to RETURNED and the asset status is shown as IN_REPAIR in the asset detail page.

7. **Report Filters and Export:** Navigate to `/reports/DeploymentSummary`. Apply a date range filter. Confirm the table updates with filtered data. Confirm the row count changes. Click "Export Excel" — confirm a `.xlsx` file downloads. Verify the exported file contains only the filtered data, not all records.

8. **Form Validation:** Submit the Create Sales Request form with missing required fields. Confirm inline validation errors appear on the correct fields. Confirm the form does not call the API. Fix all fields and submit — confirm the API is called and the user is redirected to the new deployment's detail page.

9. **Error Handling:** Simulate a 500 error from the backend (via MSW in test environment or by temporarily breaking the API). Confirm a toast notification appears with a user-friendly message. Confirm the page does not crash (ErrorBoundary does not trigger for API errors).

10. **Cross-Browser and Responsive:** Test on Chrome, Edge, and Safari. Test at 1920px (Smart TV), 1440px (desktop), and 1024px (tablet minimum). Confirm the sidebar collapses gracefully at 1024px. Confirm all dashboard charts remain readable at large screen sizes.

---

## 15. Development Roadmap

| Sprint | Weeks | Frontend Focus |
|--------|-------|---------------|
| S1–S2 | 1–8 | Project scaffold (Vite + React + TypeScript), MSAL authentication (all 5 steps from Section 4), `AuthContext`, `ProtectedRoute`, role-based routing skeleton, `axiosInstance` with token interceptor, all type definitions, `Sidebar` + `TopNav` layout shell, Login page, basic Sales Request list and create pages |
| S3 | 9–12 | BOM Packing page (checklist UI + dispatch block error handling), Dispatch workflow pages (generate + sign), Inspection pages (per-component checklist + complete flow), all corresponding API hooks, `StatusTimeline` component |
| S4 | 13–16 | All 6 dashboard pages (initial layout wired to backend data), Reports section (list + detail + export + schedule), `DataTable` with full filter/sort/paginate, all chart components, role-based dashboard redirect |
| S5 | 16–20 | AI narrative card on Executive Dashboard, `OverdueFeed` with AI-suggested actions, Finance Dashboard with billing tables, Smart TV display optimizations, self-service report builder (drag-and-drop, Sprint 5 scope) |
| S6 | 21–24 | UAT feedback incorporation, performance optimization (code splitting, lazy loading per route), accessibility audit (keyboard navigation, ARIA), cross-browser testing, Azure Static Web Apps production deployment, handover documentation |

### 15.1 Sprint 1–2 Priority — Foundation

The first two sprints establish everything other sprints depend on:
- Complete MSAL integration (Sections 4.1–4.6) must work before any protected page
- `axiosInstance` token interceptor must be validated with real Azure AD tokens
- Role-based routing skeleton must be in place so each sprint can add pages into existing slots
- All TypeScript type definitions from Section 3.4 must be created upfront — they are imported by every feature hook

### 15.2 Sprint 4 Priority — Dashboard Individual HTML Designs

Individual HTML layout files for each of the six dashboards will be provided by the design team during Sprint 4. The architecture is prepared for this: each dashboard is an isolated component file. The data-fetching hooks (`useSalesDashboard()`, etc.) are already written and returning typed data. The incoming HTML files need only to replace the placeholder JSX in each dashboard component file and bind the existing data variables. No structural changes to routing, hooks, or the API layer are required when new designs arrive.

### 15.3 Extensibility Notes

The following changes can be made without modifying existing code:
- **New dashboard:** Add a new route in `src/router/index.tsx`, a new page component in `src/pages/Dashboard/`, a new API function in `src/api/dashboard.api.ts`, and a new hook in `src/hooks/useDashboard.ts`. Add the nav item to `Sidebar.tsx` with the appropriate role guard.
- **New report type:** Add the identifier to `ReportType` in `src/types/report.types.ts`, add a handler in `src/api/reports.api.ts`, and add a card to `ReportsListPage.tsx`. The report detail page is already generic and will render any report type.
- **Schema change:** API response shape changes require updates only in `src/types/` and `src/api/`. Hook and component code consumes typed interfaces — TypeScript compile errors will pinpoint every usage that needs updating.
- **New module (e.g., new workflow type):** Add a new folder in `src/pages/`, new types in `src/types/`, new API functions in `src/api/`, new hooks in `src/hooks/`, and wire routes into `src/router/index.tsx`. No existing files need modification.

---

*End of Document — EQC Asset Management Platform Frontend Technical Specification v1.1 — May 2026*  
*Schema updated from EQC_Objects_and_Attributes.xlsx v2.0 — 17 objects, 183 fields, complete ENUM reference*
