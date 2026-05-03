import { ReactNode, useLayoutEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * Admin UI: open `/admin` (and child routes like `/admin/users`).
 * If you just changed `profiles.role` in SQL, we refresh the profile once here so `isAdmin` updates without logging out.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading, refreshProfile } = useAuth();
  const location = useLocation();
  const [verifyDone, setVerifyDone] = useState(false);

  useLayoutEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || isAdmin) {
      setVerifyDone(true);
      return;
    }

    let cancelled = false;
    void refreshProfile().finally(() => {
      if (!cancelled) setVerifyDone(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, isAdmin, refreshProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">جارٍ التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  if (!verifyDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">جارٍ تحديث صلاحياتك...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">غير مصرح</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          هذه الصفحة مخصصة لحسابات بصلاحية <span className="font-semibold">admin</span> أو{' '}
          <span className="font-semibold">super_admin</span> في جدول <code className="text-sm">profiles</code>.
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
          إذا عدّلت الدور في قاعدة البيانات للتو، حدّث الصفحة أو سجّل الخروج ثم الدخول من جديد، وتأكد أن <code className="text-sm">status</code> ليس{' '}
          <span className="font-semibold">banned</span>.
        </p>
        <Link
          to="/home"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
