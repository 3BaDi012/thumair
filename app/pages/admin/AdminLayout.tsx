import { NavLink, Outlet } from 'react-router';
import {
  LayoutDashboard,
  Package,
  Users,
  Flag,
  MessageSquareWarning,
  ScrollText,
  LogOut,
  ShoppingBag,
  Megaphone,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RequireAdmin } from '../../components/RequireAdmin';

const NAV = [
  { to: '/admin', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
  { to: '/admin/listings', label: 'الإعلانات', icon: Package, end: false },
  { to: '/admin/orders', label: 'الطلبات', icon: ShoppingBag, end: false },
  { to: '/admin/users', label: 'المستخدمون', icon: Users, end: false },
  { to: '/admin/reports', label: 'البلاغات', icon: Flag, end: false },
  { to: '/admin/feedback', label: 'الشكاوى والاقتراحات', icon: MessageSquareWarning, end: false },
  { to: '/admin/broadcast', label: 'إشعار جماعي', icon: Megaphone, end: false },
  { to: '/admin/messages', label: 'رسائل الإدارة', icon: Inbox, end: false },
  { to: '/admin/audit', label: 'سجل التدقيق', icon: ScrollText, end: false },
];

export function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminLayoutInner />
    </RequireAdmin>
  );
}

function AdminLayoutInner() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex" dir="rtl">
      <aside className="w-64 bg-gradient-to-b from-sky-900 to-emerald-700 text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <p className="text-sm text-emerald-200 mb-1">لوحة الإدارة</p>
          <h1 className="text-xl font-bold">ثمير</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="size-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 text-sm">
          <p className="font-semibold truncate">{user?.name}</p>
          <p className="text-emerald-200 text-xs truncate mb-3">{user?.email}</p>
          <button
            onClick={() => void signOut()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
