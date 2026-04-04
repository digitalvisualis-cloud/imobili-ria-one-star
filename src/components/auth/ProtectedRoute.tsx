import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { AccessDenied } from './AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  allowedRoles?: AppRole[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, role, isLoading, mustChangePassword } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (mustChangePassword && window.location.pathname !== '/trocar-senha') {
    return <Navigate to="/trocar-senha" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <AccessDenied />;
  }

  return children ? <>{children}</> : <Outlet />;
}
