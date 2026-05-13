import type { AuthUser } from '@/types/auth.types';
import { useAuthContext } from '@/context/AuthContext';

export function useCurrentUser(): AuthUser | null {
  const { user } = useAuthContext();
  return user;
}
