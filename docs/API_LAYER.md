# API Integration Layer

All API calls go through the Axios instance with Bearer token injection. The frontend communicates exclusively with the EQC backend REST API.

---

## `src/api/axiosInstance.ts`

Axios instance with base URL from `VITE_API_BASE_URL`.

- **Request interceptor:** Acquires token silently via MSAL `acquireTokenSilent({ scopes: loginRequest.scopes })`, attaches `Authorization: Bearer {token}` header. On failure, triggers `acquireTokenPopup`.
- **Response interceptor:** Normalizes errors into `ApiError` shape. On 401, clears auth state and redirects to login. On network error, throws user-friendly message.

See full implementation in [AUTH.md](./AUTH.md) — Step 5.

---

## API Functions Reference (`src/api/`)

### `auth.api.ts`
- `getMe(): Promise<AuthUser>` — calls `GET /api/auth/me`. Used on app load to fetch authenticated user's profile and role.

### `assets.api.ts`
Functions targeting the `assets` table:
- `listAssets(filters)` — available filters: `status`, `model_code`, `warehouse_code`, `demo_loaner_type`, `business_unit`, `area`, `is_active`
- `getAsset(asset_id)`
- `createAsset(payload: CreateAssetPayload)`
- `updateAsset(asset_id, payload: UpdateAssetPayload)`
- `transitionAssetStatus(asset_id, status: AssetStatus)`

### `salesRequests.api.ts`
Functions targeting the `sales_requests` table — the primary operational object:
- `listSalesRequests(filters)` — available filters: `status`, `record_type`, `purpose1`, `purpose2`, `account_id`, `sales_person_id`, `date_range`
- `getSalesRequest(request_id)`
- `createSalesRequest(payload: CreateSalesRequestPayload)`
- `approveSalesRequest(request_id)`
- `rejectSalesRequest(request_id, rejection_reason)`
- `markReturned(request_id)`
- `cancelSalesRequest(request_id)`

### `extensions.api.ts`
Functions targeting the `request_extensions` table:
- `createExtension(payload: CreateExtensionPayload)`
- `listExtensions(parent_request_id)`
- `approveExtension(extension_id)`
- `rejectExtension(extension_id)`

### `deployments.api.ts`
Functions targeting the `device_deployments` table (the asset-to-request link record, not the request itself):
- `listDeployments(filters)`
- `getDeployment(deployment_id)`
- `createDeployment(request_id, asset_id, payload)`
- `transitionDeploymentStatus(deployment_id, status: DeploymentStatus)`

> Note: Most operational actions are taken on the `SalesRequest` level; `DeviceDeployment` is updated as a side-effect by the backend.

### `bom.api.ts`
Functions targeting `bom_sets`, `bom_line_items`, and `accessory_master`:
- `listBOMSets(model_code?)`
- `getBOMSet(set_id)`
- `createBOMSet(payload)`
- `updateBOMSet(set_id, payload)`
- `getBOMLineItems(set_id)`
- `createBOMLineItem(set_id, payload)`
- `updateBOMLineItem(line_id, payload)`
- `listAccessoryMaster(filters)`
- `validatePacking(bom_set_id, packed_line_ids: string[])` → `PackingValidationResult`

### `dispatch.api.ts`
Functions targeting `dispatch_documents`:
- `generateDispatchDocument(request_id, document_type)` — available filters: `status`, `deployment_id`, `date_range`
- `getDispatchDocument(doc_id)`
- `listDispatchDocuments(filters)`
- `markSentToPrint(doc_id)`
- `uploadSignedCopy(doc_id, file: File, signed_by_name: string)`

### `inspection.api.ts`
Functions targeting `inspection_records` and `inspection_line_items`:
- `createInspection(deployment_id)`
- `getInspection(inspection_id)`
- `recordLineItemResult(inspection_id, line_id, result: InspectionResult, quantity_actual?, notes?)`
- `completeInspection(inspection_id, overall_condition: OverallCondition, notes?)`

### `repairCases.api.ts`
Functions targeting `repair_cases`:
- `listRepairCases(filters)` — available filters: `status`, `asset_id`, `account_id`, `area`, `repair_type`
- `getRepairCase(repair_id)`
- `updateRepairCase(repair_id, payload)`

> Repair cases are **auto-created by the backend** on inspection FAIL. The frontend provides read and update capability only — no create.

### `dashboard.api.ts`
- `getSalesDashboard()` → `SalesDashboardData`
- `getEQCDashboard()` → `EQCDashboardData`
- `getInventoryDashboard()` → `InventoryDashboardData`
- `getOverdueFeed()` → `OverdueFeedData`
- `getExecutiveDashboard()` → `ExecutiveDashboardData`
- `getFinanceDashboard()` → `FinanceDashboardData`

### `reports.api.ts`
- `getReportData(type: ReportType, filters)`
- `exportReport(type, filters, format: 'xlsx'|'csv'|'pdf')`
- `scheduleReport(payload)`
- `listScheduledReports()`
- `deleteScheduledReport(id)`

### `accounts.api.ts`
Functions targeting the `accounts` table:
- `listAccounts(filters)` — available filters: `area`, `segmentation`, `group_wave`
- `getAccount(account_id)`
- `createAccount(payload)`
- `updateAccount(account_id, payload)`

### `users.api.ts`
Functions targeting the `users` table (ADMIN — `System_Admin` — only):
- `listUsers()`
- `getUser(user_id)`
- `createUser(payload)`
- `updateUserRole(user_id, role: UserRole)`
- `deactivateUser(user_id)`

> `Integration_Service` role is system-only and not assignable via UI.

### `eventLog.api.ts`
Functions targeting the `event_log` table (immutable):
- `getEventLog(entity_type: EventEntityType, entity_id, pagination)` → paginated `EventLog[]`
- `getEventLogByUser(user_id, pagination)` — for admin audit views

> No create/update/delete operations from the frontend — event log is immutable.

### `serviceContracts.api.ts`
- `listServiceContracts(asset_id?)`
- `getServiceContract(contract_id)`

> Viewing only from the frontend; contracts are managed by admins.

---

## Request/Response Pattern

- **Success response shape:** `{ success: true, data: T, meta?: PaginationMeta }`
- **Error response shape:** `{ success: false, error: { code: string, message: string, details?: any } }`

### Error Handling Strategy

| HTTP Status | Error Code | Frontend Behavior |
|-------------|-----------|------------------|
| 400 | `VALIDATION_ERROR` | Display field-level errors from `details` on form fields |
| 401 | `UNAUTHORIZED` / `TOKEN_EXPIRED` | Silently re-acquire token via MSAL; redirect to login if fails |
| 403 | `INSUFFICIENT_PERMISSIONS` | Show `UnauthorizedPage` or inline "You don't have permission" message |
| 404 | `NOT_FOUND` | Show "Record not found" inline or redirect to list page |
| 409 | `BOOKING_CONFLICT` | Show conflict message with conflicting deployment details |
| 409 | `DISPATCH_BLOCKED` | Show prominent red `<AlertBanner>` listing `details.missingItems` array |
| 500 | `INTERNAL_ERROR` | Show generic error toast; log to console |
| Network error | `NETWORK_ERROR` | Show "Check your connection" toast |

---

## Optimistic Updates Policy

- **Never optimistic:** Status transitions (approve, dispatch, inspect, BOM validate). Always wait for server confirmation before updating UI.
- **Optimistic where safe:** Adding a note or non-critical metadata update — immediately reflect in UI, rollback on error.

---

## Cache Invalidation Strategy

TanStack Query cache keys follow this pattern: `['assets', filters]`, `['deployment', id]`, `['dashboard', 'sales']`.

Mutations invalidate all related query keys. Example: approving a deployment invalidates `['deployments']`, `['dashboard', 'eqc']`, and `['dashboard', 'manager']`.
