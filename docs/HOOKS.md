# Custom Hooks (`src/hooks/`)

All data-fetching hooks use TanStack Query v5. Auth hooks wrap MSAL and AuthContext.

---

## Auth Hooks

**`useAuth.ts`**  
Wraps `useMsal()` and `AuthUser` context. Returns `{ user, isLoading, isAuthenticated, login, logout }`.
- `login()` → `instance.loginPopup(loginRequest)` → calls `getMe()` to fetch backend user profile
- `logout()` → `instance.logoutPopup()`

**`useCurrentUser.ts`**  
Returns `AuthUser` from context. Throws if called outside `AuthProvider`. Used throughout the app to access `user.role` for RBAC rendering.

**`useHasRole.ts`**  
`useHasRole(...roles: UserRole[]): boolean` — returns `true` if current user's role is in the allowed list. Used for conditional rendering of UI elements.

---

## Domain Hooks

### `useAssets.ts`
TanStack Query hooks for the `assets` table:
- `useAssets(filters)` — list query
- `useAsset(asset_id)` — single record query
- `useCreateAsset()` — mutation; invalidates `['assets']` and dashboard queries on success
- `useUpdateAsset()` — mutation; invalidates `['assets']` on success
- `useTransitionAssetStatus()` — mutation; invalidates `['assets']` and relevant dashboard caches on success

### `useSalesRequests.ts`
TanStack Query hooks for the `sales_requests` table:
- `useSalesRequests(filters)` — list query
- `useSalesRequest(request_id)` — single record query
- `useCreateSalesRequest()` — mutation
- `useApproveSalesRequest()` — mutation; invalidates `['salesRequests']` and relevant dashboard caches
- `useRejectSalesRequest()` — mutation; invalidates `['salesRequests']`
- `useMarkReturned()` — mutation
- `useCancelSalesRequest()` — mutation

All mutations invalidate `['salesRequests']` and relevant dashboard caches.

### `useExtensions.ts`
- `useExtensions(parent_request_id)` — list query for extensions under a parent request
- `useCreateExtension()` — mutation; invalidates parent `SalesRequest` query
- `useApproveExtension()` — mutation; invalidates parent `SalesRequest` query
- `useRejectExtension()` — mutation; invalidates parent `SalesRequest` query

### `useDeployments.ts`
TanStack Query hooks for the `device_deployments` table:
- `useDeployments(filters)` — list query
- `useDeployment(deployment_id)` — single record query

> Most deployment state changes flow from `useSalesRequests` mutations. This hook is used primarily for reading deployment details and history.

### `useBOM.ts`
- `useBOMSets(model_code?)` — list BOM sets, optionally filtered by model code
- `useBOMSet(set_id)` — single BOM set
- `useBOMLineItems(set_id)` — line items for a set
- `useAccessoryMaster(filters)` — accessory catalog
- `useCreateBOMSet()` — mutation
- `useUpdateBOMSet()` — mutation
- `useCreateBOMLineItem()` — mutation
- `useUpdateBOMLineItem()` — mutation
- `useValidatePacking()` — mutation; calls `validatePacking(bom_set_id, packed_line_ids)` → returns `PackingValidationResult`

### `useDispatch.ts`
- `useDispatchDocuments(filters)` — list query
- `useDispatchDocument(doc_id)` — single document query
- `useGenerateDispatchDocument()` — mutation
- `useMarkSentToPrint()` — mutation
- `useUploadSignedCopy()` — mutation

### `useInspection.ts`
- `useInspection(inspection_id)` — single inspection query
- `useCreateInspection()` — mutation
- `useRecordLineItemResult()` — mutation; records Pass/Fail/Missing per BOM line item
- `useCompleteInspection()` — mutation; finalizes the inspection and triggers asset status update on the backend

### `useRepairCases.ts`
- `useRepairCases(filters)` — list query
- `useRepairCase(repair_id)` — single record query
- `useUpdateRepairCase()` — mutation (repair cases are auto-created by backend; frontend only reads and updates)

### `useDashboard.ts`
- `useSalesDashboard()` — calls `GET /api/dashboard/sales`
- `useEQCDashboard()` — calls `GET /api/dashboard/service`
- `useInventoryDashboard()` — calls `GET /api/dashboard/inventory`
- `useOverdueFeed()` — calls `GET /api/dashboard/overdue`
- `useExecutiveDashboard()` — calls `GET /api/dashboard/executive`
- `useFinanceDashboard()` — calls `GET /api/dashboard/finance`

All dashboard hooks use: `{ staleTime: 5 * 60 * 1000, refetchInterval: 5 * 60 * 1000 }` for 5-minute auto-refresh.

### `useReports.ts`
- `useReportData(type, filters)` — fetches report data with current filters
- `useExportReport()` — mutation; calls export endpoint, triggers file download
- `useScheduledReports()` — list saved scheduled reports
- `useCreateScheduledReport()` — mutation
- `useDeleteScheduledReport()` — mutation

---

## Utility Hooks

**`usePagination.ts`**  
Generic hook managing `page`, `limit`, `setPage`, `setLimit` state. Used alongside TanStack Table for server-side pagination.

**`useDebounce.ts`**  
`useDebounce<T>(value: T, delay: number): T` — debounces search input before firing API calls. Used in `<AccountSelector />`, `<AssetSelector />`, and filter search inputs.
