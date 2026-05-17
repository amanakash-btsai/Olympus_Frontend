// ─────────────────────────────────────────────────────────────────────────────
// FILE: hooks/useHasRole.ts
// A tiny convenience hook for role-based UI rendering.
//
// Usage: const canApprove = useHasRole('Sales_Manager', 'System_Admin');
// If `canApprove` is true, show the Approve button. If false, hide it.
//
// This is purely for UI — the backend enforces the actual access control.
// Never rely only on frontend role checks for security.
// ─────────────────────────────────────────────────────────────────────────────

import type { UserRole } from '@/types/enums';
import { useAuthContext } from '@/context/AuthContext';

// Returns true if the currently logged-in user has ANY of the specified roles.
export function useHasRole(...roles: UserRole[]): boolean {
  const { user } = useAuthContext();
  if (!user) return false;
  return roles.includes(user.role);
}
