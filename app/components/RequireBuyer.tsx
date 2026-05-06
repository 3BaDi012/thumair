import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function RequireBuyer({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">جارٍ التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (!user?.userType) return <Navigate to="/welcome" replace />;

  if (user.userType !== 'buyer') return <Navigate to="/dashboard/farmer" replace />;

  return <>{children}</>;
}

