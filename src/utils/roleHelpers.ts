import type { UserRole } from '@/types/enums';

export function hasRole(userRole: UserRole | undefined, ...roles: UserRole[]): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

export function canAccess(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  return hasRole(userRole, ...allowedRoles);
}

export const ADMIN_ROLES: UserRole[] = ['EQC_Manager', 'System_Admin'];
export const MANAGER_ROLES: UserRole[] = ['EQC_Manager', 'Sales_Manager', 'System_Admin'];
export const OPERATIONS_ROLES: UserRole[] = ['EQC_Operator', 'EQC_Manager', 'System_Admin'];
