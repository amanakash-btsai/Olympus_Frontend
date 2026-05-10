# Routing & Role-Based Access Control

All role names correspond directly to `users.role` ENUM values. The frontend never hardcodes role strings — always import from `src/types/enums.ts`.

---

## Router Files (`src/router/`)

**`src/router/index.tsx`** — Main route config using `createBrowserRouter`. Top-level routes:
- `/login` → `<LoginPage />`
- `/` → `<AuthenticatedLayout />` with nested routes for all authenticated pages
- `*` → `<NotFoundPage />`

**`src/router/ProtectedRoute.tsx`** — Wrapper component. Checks `useIsAuthenticated()`. If false, redirects to `/login` with current path saved in location state. If authenticated but role not in `allowedRoles` prop, renders `<UnauthorizedPage />`.

**`src/router/RoleRedirect.tsx`** — At `/dashboard`, resolves which sub-route to redirect to based on `user.role`:

| Role | Redirect |
|------|----------|
| `Sales_Rep` | `/dashboard/sales` |
| `FSE` | `/dashboard/sales` |
| `EQC_Operator` | `/dashboard/eqc` |
| `EQC_Manager` | `/dashboard/manager` |
| `Sales_Manager` | `/dashboard/manager` |
| `Executive` | `/dashboard/executive` |
| `System_Admin` | `/dashboard/executive` |
| `Integration_Service` | `/dashboard/inventory` (service account — read-only) |

---

## Full Route Table

| Path | Component | Allowed Roles | Notes |
|------|-----------|---------------|-------|
| `/login` | `LoginPage` | Public | Redirects to `/dashboard` if already authenticated |
| `/` | Redirect | All | Redirects to `/dashboard` |
| `/dashboard` | `RoleRedirect` | All | Redirects to role-specific dashboard sub-route |
| `/dashboard/sales` | `SalesDashboard` | Sales_Rep, FSE, Sales_Manager, System_Admin | Sales KPIs and request pipeline |
| `/dashboard/eqc` | `EQCDashboard` | EQC_Operator, EQC_Manager, System_Admin | EQC ops action queue |
| `/dashboard/manager` | `ManagerDashboard` | EQC_Manager, Sales_Manager, System_Admin | Overdue feed + approval queue |
| `/dashboard/inventory` | `InventoryDashboard` | EQC_Operator, EQC_Manager, Sales_Manager, System_Admin | Asset inventory and warehouse view |
| `/dashboard/executive` | `ExecutiveDashboard` | Executive, Sales_Manager, EQC_Manager, System_Admin | KPI trends, AI narrative |
| `/dashboard/finance` | `FinanceDashboard` | Sales_Manager, EQC_Manager, Executive, System_Admin | Billing, rental revenue, repair costs |
| `/sales-requests` | `SalesRequestListPage` | All | Role-filtered: Sales_Rep/FSE see own; managers see all |
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

---

## ProtectedRoute Implementation

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

---

## RoleGuard Component (Inline Rendering)

For hiding/showing buttons and sections within a page based on role:

```typescript
// src/components/forms/RoleGuard.tsx
export function RoleGuard({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { user } = useCurrentUser();
  if (!user || !roles.includes(user.role)) return null;
  return <>{children}</>;
}

// Usage:
<RoleGuard roles={["EQC_Manager", "System_Admin"]}>
  <Button onClick={approve}>Approve</Button>
</RoleGuard>
```

---

## Sidebar Navigation Structure

The sidebar renders items based on `user.role`. Items not accessible to the current role are **hidden entirely** (not disabled).

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

Sidebar specs:
- Fixed left navigation
- Width: 240px on desktop, collapsible to icon-only (60px) on tablet
- Bottom section: user avatar, name, role badge, logout button
- Active item highlighted
