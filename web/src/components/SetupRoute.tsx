import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SetupRouteProps {
  children: ReactNode;
}

export function SetupRoute({ children }: SetupRouteProps) {
  const { loading, setupRequired } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If setup is not required, redirect to login
  if (!setupRequired) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
