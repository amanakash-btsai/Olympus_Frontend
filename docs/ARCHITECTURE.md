# Architecture Overview

**Stack:** React 18 / TypeScript SPA, built with Vite, deployed on Azure Static Web Apps (or AKS alongside the backend).

---

## Technology Stack

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

## Key Architectural Principles

- **MSAL-first authentication** — no username/password forms; all login flows go through Azure AD popup/redirect. JWT access token from MSAL is forwarded to the backend on every API call.
- **Token stored in memory only** — never in `localStorage` or `sessionStorage`. MSAL handles its own token cache via `sessionStorage` internally; the backend-issued access token is kept in React state/context only.
- **Role-based rendering** — sidebar, navigation, and page availability are entirely governed by `user.role` returned in the JWT payload from the backend.
- **Optimistic UI where safe, pessimistic where critical** — status transitions (approve, dispatch, inspect) always wait for server confirmation. Non-destructive reads use stale-while-revalidate via TanStack Query.
- **Extensible dashboard architecture** — each dashboard is an isolated route module. New dashboards can be added without modifying any other page.
- **DB schema and UI design are subject to change** — all data-fetching hooks are centralized in `src/api/` and all UI layouts are isolated in `src/pages/` so schema changes require only hook updates and design changes require only layout updates.
- **Dispatch block is enforced on the server** — the frontend shows the `DISPATCH_BLOCKED` error with `missingItems` list when the backend returns HTTP 409, but never attempts to enforce or bypass this rule itself.
- The frontend communicates **exclusively** with the EQC backend REST API. It does not connect directly to Salesforce, SAP, Azure Blob, or Teams — all integrations are orchestrated by the backend. The only direct external dependency is Azure AD.

---

## Full Folder and File Structure

### Root Level & Configuration Files

| File | Purpose |
|------|---------|
| `.env.example` | Template showing all required environment variables. Committed to source control. Developers copy to `.env.local`. Never committed with real values. |
| `.gitignore` | Excludes: `node_modules/`, `dist/`, `.env.local`, `coverage/`, `*.log` |
| `index.html` | Vite entry HTML. Contains `<div id="root">` and `<script type="module" src="/src/main.tsx">`. No inline scripts. |
| `vite.config.ts` | Sets `@` path alias to `./src`. Enables React plugin. Configures `/api` proxy to backend in dev (avoids CORS). Sets build output to `dist/`. |
| `tsconfig.json` | Strict mode. Path aliases: `@` → `src/`. `target: ES2020`. `moduleResolution: bundler`. `jsx: react-jsx`. |
| `tsconfig.node.json` | TypeScript config for Vite config file itself (Node context). |
| `tailwind.config.ts` | Extends default theme with Olympus brand colors (primary blue, accent teal, neutral grays). Configures content paths for purging. |
| `package.json` | Scripts: `dev` (vite), `build` (tsc && vite build), `preview`, `test` (vitest), `lint` (eslint), `format` (prettier). |
| `eslint.config.ts` | ESLint flat config. Uses `@typescript-eslint/recommended`, `plugin:react-hooks/recommended`, `plugin:jsx-a11y/recommended`. Enforces no `console.log` in production. |
| `staticwebapp.config.json` | Azure Static Web Apps routing rules. Routes all paths to `index.html` for SPA routing. Sets CSP, HSTS, X-Frame-Options headers. |

### Entry Points (`src/`)

**`src/main.tsx`** — Application entry point. Creates MSAL `PublicClientApplication` from `msalConfig`. Wraps tree in `MsalProvider`, `BrowserRouter`, `QueryClientProvider`. Renders `<App />`.

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

**`src/App.tsx`** — Root component. Renders route tree. Conditionally renders `<AuthenticatedLayout>` vs `<LoginPage>` based on MSAL authentication state via `useIsAuthenticated()`. Renders global `<Toaster />`.

**`src/authConfig.ts`** — See [AUTH.md](./AUTH.md).

### Directory Map

```
src/
├── main.tsx                        # App entry point
├── App.tsx                         # Root component + route tree
├── authConfig.ts                   # MSAL configuration constants
├── config/
│   └── env.ts                      # Zod-validated environment variables
├── types/                          # All TypeScript interfaces — see TYPES.md
│   ├── auth.types.ts
│   ├── enums.ts
│   ├── api.types.ts
│   ├── asset.types.ts
│   ├── salesRequest.types.ts
│   ├── extension.types.ts
│   ├── bom.types.ts
│   ├── deployment.types.ts
│   ├── dispatch.types.ts
│   ├── inspection.types.ts
│   ├── repair.types.ts
│   ├── account.types.ts
│   ├── eventLog.types.ts
│   ├── user.types.ts
│   ├── report.types.ts
│   └── dashboard.types.ts
├── api/                            # API functions — see API_LAYER.md
│   ├── axiosInstance.ts
│   ├── auth.api.ts
│   ├── assets.api.ts
│   ├── salesRequests.api.ts
│   ├── extensions.api.ts
│   ├── deployments.api.ts
│   ├── bom.api.ts
│   ├── dispatch.api.ts
│   ├── inspection.api.ts
│   ├── repairCases.api.ts
│   ├── dashboard.api.ts
│   ├── reports.api.ts
│   ├── accounts.api.ts
│   ├── users.api.ts
│   ├── eventLog.api.ts
│   └── serviceContracts.api.ts
├── hooks/                          # TanStack Query hooks — see HOOKS.md
│   ├── useAuth.ts
│   ├── useCurrentUser.ts
│   ├── useHasRole.ts
│   ├── useAssets.ts
│   ├── useSalesRequests.ts
│   ├── useExtensions.ts
│   ├── useDeployments.ts
│   ├── useBOM.ts
│   ├── useDispatch.ts
│   ├── useInspection.ts
│   ├── useRepairCases.ts
│   ├── useDashboard.ts
│   ├── useReports.ts
│   ├── usePagination.ts
│   └── useDebounce.ts
├── context/
│   ├── AuthContext.tsx              # AuthUser context + AuthProvider
│   └── ThemeContext.tsx             # Light/dark mode
├── layouts/
│   ├── AuthenticatedLayout.tsx      # Shell: Sidebar + TopNav + Outlet
│   └── PublicLayout.tsx             # Minimal layout for /login
├── router/
│   ├── index.tsx                    # createBrowserRouter config
│   ├── ProtectedRoute.tsx           # Auth + role guard wrapper
│   └── RoleRedirect.tsx             # /dashboard → role-specific sub-route
├── pages/                          # Feature page modules — see PAGES.md
│   ├── Login/
│   ├── Dashboard/
│   ├── SalesRequests/
│   ├── Assets/
│   ├── BOM/
│   ├── Dispatch/
│   ├── Inspection/
│   ├── RepairCases/
│   ├── Accounts/
│   ├── Users/
│   ├── Reports/
│   ├── Audit/
│   ├── NotFound/
│   └── Unauthorized/
├── components/                     # Shared component library — see COMPONENTS.md
│   ├── ui/
│   ├── layout/
│   ├── data/
│   ├── charts/
│   ├── status/
│   ├── forms/
│   └── feedback/
└── utils/
    ├── formatters.ts               # Date, currency, duration formatters
    ├── statusHelpers.ts            # Status color maps and overdue helpers
    ├── roleHelpers.ts              # Role predicate functions (canApprove, etc.)
    ├── exportHelpers.ts            # Excel, CSV, PDF export via SheetJS + jspdf
    └── queryHelpers.ts             # buildQueryString / parseQueryString
```

### Utils Reference

**`src/utils/formatters.ts`**
- `formatDate(date, locale?)` — ISO date to display string
- `formatDateTH(date)` — Thai locale date formatting
- `formatCurrency(amount, currency?)` — Thai Baht formatting
- `formatDuration(days)` — e.g., "14 days"
- `formatDeploymentId(id)` — display-friendly deployment ID

**`src/utils/statusHelpers.ts`**
- `getAssetStatusColor(status: AssetStatus)` → Tailwind color class (15 values)
- `getSalesRequestStatusColor(status: SalesRequestStatus)` → Tailwind color class (11 values)
- `getRepairCaseStatusColor(status: RepairCaseStatus)` → Tailwind color class
- `getDispatchDocStatusColor(status: DispatchDocStatus)` → Tailwind color class
- `getSeverityColor(daysOverdue: number)` → color class for overdue severity banding
- `isOverdue(expected_return_date: string)` → boolean
- `daysOverdue(expected_return_date: string)` → number (positive = overdue, negative = days remaining)

**`src/utils/roleHelpers.ts`**

All predicates accept `role: UserRole`:

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
- `exportToExcel(data, filename)` — SheetJS `.xlsx` client-side export
- `exportToCSV(data, filename)` — CSV export
- `exportToPDF(data, filename)` — jspdf tabular PDF

**`src/utils/queryHelpers.ts`**
- `buildQueryString(filters)` — object → URL query string
- `parseQueryString(search)` — URL query string → filters object (used to persist filter state in URL)

---

## Extensibility Rules

The following changes can be made **without modifying existing code**:

- **New dashboard:** Add route in `src/router/index.tsx`, new page in `src/pages/Dashboard/`, new API function in `src/api/dashboard.api.ts`, new hook in `src/hooks/useDashboard.ts`, nav item in `Sidebar.tsx` with role guard.
- **New report type:** Add identifier to `ReportType` in `src/types/report.types.ts`, handler in `src/api/reports.api.ts`, card in `ReportsListPage.tsx`. The detail page is already generic.
- **Schema change:** Update `src/types/` and `src/api/`. TypeScript compile errors surface every usage that needs updating.
- **New module:** Add folder in `src/pages/`, types in `src/types/`, API functions in `src/api/`, hooks in `src/hooks/`, wire routes in `src/router/index.tsx`.
