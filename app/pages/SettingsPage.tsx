import { Link } from 'react-router';
import { User, Moon, Sun, ArrowRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const dashboardPath = user?.userType === 'buyer' ? '/dashboard/buyer' : '/dashboard/farmer';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            to={dashboardPath}
            className="inline-flex items-center gap-2 text-sky-900 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition mb-4"
          >
            <ArrowRight className="size-5" />
            العودة للوحة التحكم
          </Link>
          <h1 className="text-4xl font-bold text-sky-900 dark:text-white">الإعدادات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">إدارة إعدادات حسابك والتفضيلات</p>
        </div>

        <div className="space-y-4">
          {/* Profile Edit Link */}
          <Link
            to="/profile/edit"
            className="block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-900 dark:to-emerald-900 text-sky-900 dark:text-sky-400 rounded-xl flex items-center justify-center">
                  <User className="size-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    تعديل الملف الشخصي
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    قم بتحديث معلوماتك الشخصية وصورة الملف الشخصي
                  </p>
                </div>
              </div>
              <ChevronLeft className="size-6 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
            </div>
          </Link>

          {/* Dark Mode Toggle */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 bg-gradient-to-br from-amber-100 to-purple-100 dark:from-amber-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
                  {isDarkMode ? (
                    <Moon className="size-7 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Sun className="size-7 text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    الوضع الداكن
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isDarkMode ? 'الوضع الداكن مفعّل حالياً' : 'الوضع الفاتح مفعّل حالياً'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  isDarkMode ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 size-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    isDarkMode ? 'translate-x-1' : 'translate-x-9'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
