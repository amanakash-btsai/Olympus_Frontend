// ─────────────────────────────────────────────────────────────────────────────
// FILE: router/RoleRedirect.tsx
// When a user navigates to /dashboard (the generic URL), this component
// redirects them to the dashboard that makes sense for their role.
//
// This means a Sales Rep who visits /dashboard ends up on the Assets workspace,
// while an EQC Manager ends up on the EQC operations dashboard.
//
// It renders null during loading to avoid a brief wrong-route flash.
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';

export default function RoleRedirect() {
  const { user, isLoading } = useAuthContext();

  // Still loading — render nothing and wait (ProtectedRoute shows the spinner).
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Each role group gets a different default landing page.
  switch (user.role) {
    case 'Sales_Rep':
    case 'FSE':
      // Field sales reps and field service engineers land on the asset search page.
      return <Navigate to="/assets" replace />;
    case 'Sales_Manager':
      // Sales managers see the approval queue and pipeline KPIs.
      return <Navigate to="/dashboard/manager" replace />;
    case 'EQC_Operator':
    case 'EQC_Manager':
      // EQC (Equipment Quality Control) warehouse team sees equipment status board.
      return <Navigate to="/dashboard/eqc" replace />;
    case 'Executive':
    case 'System_Admin':
      // Executives and admins see the full analytics dashboard.
      return <Navigate to="/dashboard/executive" replace />;
    default:
      return <Navigate to="/assets" replace />;
  }
}
