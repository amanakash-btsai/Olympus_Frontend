import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';

export default function RoleRedirect() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to="/dashboard/eqc" replace />;
}
