import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppShell } from './layout/AppShell';
import { Spinner } from './ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell>{children}</AppShell>;
}