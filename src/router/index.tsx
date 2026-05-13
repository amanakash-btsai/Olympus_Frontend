import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import PublicLayout from '@/layouts/PublicLayout';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import RoleRedirect from '@/router/RoleRedirect';

// Public pages
const LoginPage        = lazy(() => import('@/pages/Login/LoginPage'));
const NotFoundPage     = lazy(() => import('@/pages/NotFound/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('@/pages/Unauthorized/UnauthorizedPage'));

// Dashboard pages
const SalesDashboard     = lazy(() => import('@/pages/Dashboard/SalesDashboard'));
const EQCDashboard       = lazy(() => import('@/pages/Dashboard/EQCDashboard'));
const ManagerDashboard   = lazy(() => import('@/pages/Dashboard/ManagerDashboard'));
const ExecutiveDashboard = lazy(() => import('@/pages/Dashboard/ExecutiveDashboard'));
const InventoryDashboard = lazy(() => import('@/pages/Dashboard/InventoryDashboard'));
const FinanceDashboard   = lazy(() => import('@/pages/Dashboard/FinanceDashboard'));

// Asset pages
const AssetsWorkspacePage = lazy(() => import('@/pages/Assets/AssetsWorkspacePage'));
const AssetDetailPage     = lazy(() => import('@/pages/Assets/AssetDetailPage'));
const CreateAssetPage     = lazy(() => import('@/pages/Assets/CreateAssetPage'));

// Sales Request pages
const SalesRequestListPage   = lazy(() => import('@/pages/SalesRequests/SalesRequestListPage'));
const CreateSalesRequestPage = lazy(() => import('@/pages/SalesRequests/CreateSalesRequestPage'));
const SalesRequestDetailPage = lazy(() => import('@/pages/SalesRequests/SalesRequestDetailPage'));

// BOM pages
const BOMSetsPage      = lazy(() => import('@/pages/BOM/BOMSetsPage'));
const BOMSetDetailPage = lazy(() => import('@/pages/BOM/BOMSetDetailPage'));
const BOMPackingPage   = lazy(() => import('@/pages/BOM/BOMPackingPage'));

// Dispatch pages
const DispatchListPage     = lazy(() => import('@/pages/Dispatch/DispatchListPage'));
const GenerateDispatchPage = lazy(() => import('@/pages/Dispatch/GenerateDispatchPage'));
const DispatchDocumentPage = lazy(() => import('@/pages/Dispatch/DispatchDocumentPage'));

// Inspection pages
const InspectionListPage   = lazy(() => import('@/pages/Inspection/InspectionListPage'));
const CreateInspectionPage = lazy(() => import('@/pages/Inspection/CreateInspectionPage'));
const InspectionDetailPage = lazy(() => import('@/pages/Inspection/InspectionDetailPage'));

// Repair Case pages
const RepairCaseListPage   = lazy(() => import('@/pages/RepairCases/RepairCaseListPage'));
const RepairCaseDetailPage = lazy(() => import('@/pages/RepairCases/RepairCaseDetailPage'));

// Account pages
const AccountListPage   = lazy(() => import('@/pages/Accounts/AccountListPage'));
const AccountDetailPage = lazy(() => import('@/pages/Accounts/AccountDetailPage'));

// Remaining modules
const UserListPage = lazy(() => import('@/pages/Users/UserListPage'));
const ReportsPage  = lazy(() => import('@/pages/Reports/ReportsPage'));
const AuditLogPage = lazy(() => import('@/pages/Audit/AuditLogPage'));

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <PublicLayout />,
    children: [
      { index: true, element: <S><LoginPage /></S> },
    ],
  },
  {
    path: '/unauthorized',
    element: <S><UnauthorizedPage /></S>,
  },

  // ── Authenticated routes ────────────────────────────────────────────────────
  {
    path: '/',
    element: <ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // Dashboard
      { path: 'dashboard',           element: <S><RoleRedirect /></S> },
      { path: 'dashboard/eqc',       element: <S><EQCDashboard /></S> },
      { path: 'dashboard/sales',     element: <S><SalesDashboard /></S> },
      { path: 'dashboard/manager',   element: <S><ManagerDashboard /></S> },
      { path: 'dashboard/inventory', element: <S><InventoryDashboard /></S> },
      { path: 'dashboard/executive', element: <S><ExecutiveDashboard /></S> },
      { path: 'dashboard/finance',   element: <S><FinanceDashboard /></S> },

      // Assets (workspace with tab system)
      { path: 'assets',           element: <S><AssetsWorkspacePage /></S> },
      { path: 'assets/new',       element: <S><CreateAssetPage /></S> },
      { path: 'assets/:asset_id', element: <S><AssetDetailPage /></S> },

      // Sales Requests
      { path: 'sales-requests',            element: <S><SalesRequestListPage /></S> },
      { path: 'sales-requests/new',        element: <S><CreateSalesRequestPage /></S> },
      { path: 'sales-requests/:request_id', element: <S><SalesRequestDetailPage /></S> },

      // BOM
      { path: 'bom',                        element: <S><BOMSetsPage /></S> },
      { path: 'bom/packing/:request_id',    element: <S><BOMPackingPage /></S> },
      { path: 'bom/:set_id',                element: <S><BOMSetDetailPage /></S> },

      // Dispatch
      { path: 'dispatch',          element: <S><DispatchListPage /></S> },
      { path: 'dispatch/generate', element: <S><GenerateDispatchPage /></S> },
      { path: 'dispatch/:doc_id',  element: <S><DispatchDocumentPage /></S> },

      // Inspection
      { path: 'inspections',                  element: <S><InspectionListPage /></S> },
      { path: 'inspections/new',              element: <S><CreateInspectionPage /></S> },
      { path: 'inspections/:inspection_id',   element: <S><InspectionDetailPage /></S> },

      // Repair Cases
      { path: 'repair-cases',           element: <S><RepairCaseListPage /></S> },
      { path: 'repair-cases/:repair_id', element: <S><RepairCaseDetailPage /></S> },

      // Accounts
      { path: 'accounts',           element: <S><AccountListPage /></S> },
      { path: 'accounts/:account_id', element: <S><AccountDetailPage /></S> },

      // Other
      { path: 'reports', element: <S><ReportsPage /></S> },
      { path: 'users',   element: <S><UserListPage /></S> },
      { path: 'audit',   element: <S><AuditLogPage /></S> },
    ],
  },

  // ── Catch-all ───────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <S><NotFoundPage /></S>,
  },
]);
