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
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

const NAV = [
  { to: '/admin', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/listings', labelAr: 'الإعلانات', labelEn: 'Listings', icon: Package, end: false },
  { to: '/admin/orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: ShoppingBag, end: false },
  { to: '/admin/users', labelAr: 'المستخدمون', labelEn: 'Users', icon: Users, end: false },
  { to: '/admin/reports', labelAr: 'البلاغات', labelEn: 'Reports', icon: Flag, end: false },
  { to: '/admin/feedback', labelAr: 'الشكاوى والاقتراحات', labelEn: 'Feedback', icon: MessageSquareWarning, end: false },
  { to: '/admin/broadcast', labelAr: 'إشعار جماعي', labelEn: 'Broadcast', icon: Megaphone, end: false },
  { to: '/admin/messages', labelAr: 'رسائل الإدارة', labelEn: 'Admin messages', icon: Inbox, end: false },
  { to: '/admin/audit', labelAr: 'سجل التدقيق', labelEn: 'Audit log', icon: ScrollText, end: false },
] as const;

export function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminLayoutInner />
    </RequireAdmin>
  );
}

function AdminLayoutInner() {
  const { user, signOut } = useAuth();
  const { locale } = useLocale();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex" dir={locale === 'en' ? 'ltr' : 'rtl'}>
      <aside className="w-64 bg-gradient-to-b from-sky-900 to-emerald-700 text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <p className="text-sm text-emerald-200 mb-1">{bi(locale, 'لوحة الإدارة', 'Admin')}</p>
          <h1 className="text-xl font-bold">{bi(locale, 'ثمير', 'Thumair')}</h1>
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
              {bi(locale, item.labelAr, item.labelEn)}
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
            {bi(locale, 'تسجيل الخروج', 'Sign out')}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
