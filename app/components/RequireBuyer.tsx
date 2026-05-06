import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { bi } from '../i18n/bilingual';

export function RequireBuyer({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const { locale } = useLocale();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">
          {bi(locale, 'جارٍ التحقق من الصلاحيات...', 'Verifying permissions...')}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (!user?.userType) return <Navigate to="/home" replace />;

  if (user.userType !== 'buyer') return <Navigate to="/dashboard/farmer" replace />;

  return <>{children}</>;
}

