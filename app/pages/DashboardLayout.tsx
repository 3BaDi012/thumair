import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, User } from 'lucide-react';
import { ThumairLogoWithText } from '../components/ThumairLogo';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { NotificationsSidebar } from '../components/NotificationsSidebar';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/NotificationBell';

export function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <Link to="/home" className="hover:opacity-80 transition">
            <ThumairLogoWithText />
          </Link>

          <div className="flex items-center gap-4">
            <NotificationBell onClick={() => setIsNotificationsOpen(true)} />

            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 pr-4 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition p-2"
            >
              <div className="size-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="size-5" />
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'مستخدم'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.userType === 'buyer' ? 'مشتري' : user?.userType === 'farmer' ? 'مزارع' : 'مورد'}
                </p>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
              title="تسجيل الخروج"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            <Link
              to="/dashboard/farmer"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition"
            >
              <LayoutDashboard className="size-5" />
              <span>لوحة التحكم</span>
            </Link>

            <Link
              to="/products"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition"
            >
              <Package className="size-5" />
              <span>المنتجات</span>
            </Link>

            <Link
              to="#"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition"
            >
              <ShoppingCart className="size-5" />
              <span>الطلبات</span>
            </Link>

            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition"
            >
              <Settings className="size-5" />
              <span>الإعدادات</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>

      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationsSidebar isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
}
