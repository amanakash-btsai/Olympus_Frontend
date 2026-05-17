// ─────────────────────────────────────────────────────────────────────────────
// FILE: utils/roleHelpers.ts
// Utility functions and role groupings for access control in the UI.
//
// hasRole / canAccess: used in non-hook contexts (e.g. inside utility functions
// where you have the role as a variable but aren't in a React component).
// For React components, prefer the useHasRole() hook instead.
//
// Role group constants (ADMIN_ROLES, etc.) let you write:
//   canAccess(user.role, MANAGER_ROLES)  instead of
//   canAccess(user.role, ['EQC_Manager', 'Sales_Manager', 'System_Admin'])
// ─────────────────────────────────────────────────────────────────────────────

import type { UserRole } from '@/types/enums';

// hasRole: returns true if `userRole` is in the list of allowed roles.
export function hasRole(userRole: UserRole | undefined, ...roles: UserRole[]): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

// canAccess: same as hasRole but accepts an array (for named role groups).
export function canAccess(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  return hasRole(userRole, ...allowedRoles);
}

// Named role groups — use these instead of repeating role arrays everywhere.
export const ADMIN_ROLES: UserRole[] = ['EQC_Manager', 'System_Admin'];
export const MANAGER_ROLES: UserRole[] = ['EQC_Manager', 'Sales_Manager', 'System_Admin'];
export const OPERATIONS_ROLES: UserRole[] = ['EQC_Operator', 'EQC_Manager', 'System_Admin'];
