import type { UserRole } from '@/types/enums';
import { useAuthContext } from '@/context/AuthContext';

export function useHasRole(...roles: UserRole[]): boolean {
  const { user } = useAuthContext();
  if (!user) return false;
  return roles.includes(user.role);
}
