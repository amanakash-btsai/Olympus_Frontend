// ─────────────────────────────────────────────────────────────────────────────
// FILE: router/ProtectedRoute.tsx
// A "gate" component that wraps every authenticated route.
//
// Three outcomes:
//   1. Auth is still loading (page just refreshed) → show a spinner.
//      This prevents a flash to the login page while the session recovers.
//   2. No user logged in → redirect to /login, remembering the original URL
//      in `state.from` so we can redirect back after login.
//   3. User is logged in → render the actual page (children).
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAuthContext();
  const location = useLocation();

  // Auth recovery is in progress — show spinner instead of redirecting.
  // Without this, a page refresh would immediately flash /login.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Not logged in — redirect to login. `state.from` records where the user
  // tried to go so the login page can redirect them there after success.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in — render the page they asked for.
  return <>{children}</>;
}
