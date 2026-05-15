import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  role?: 'guru' | 'student' | 'admin';
}

export function ProtectedRoute({ role }: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (role === 'guru' && !user.isGuru) return <Navigate to="/" replace />;
  if (role === 'admin' && !user.isAdmin) return <Navigate to="/" replace />;
  if (role === 'student' && !user.isStudent) return <Navigate to="/" replace />;

  return <Outlet />;
}
