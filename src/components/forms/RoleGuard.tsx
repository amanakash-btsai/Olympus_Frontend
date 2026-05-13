import type { UserRole } from '@/types/enums';
import { useAuthContext } from '@/context/AuthContext';

interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user } = useAuthContext();
  if (!user || !roles.includes(user.role)) return null;
  return <>{children}</>;
}
