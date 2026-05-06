import { useEffect, useState } from 'react';
import { Package, Users, Flag, MessageSquareWarning, ShoppingBag, TrendingUp, LogIn, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

interface Kpis {
  publishedListings: number;
  newListings7d: number;
  totalUsers: number;
  newUsers7d: number;
  openReports: number;
  newFeedback: number;
  pendingOrders: number;
  csatAvg: number | null;
  logins24h: number;
  visits24h: number;
}

const sevenDaysAgo = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const twentyFourHoursAgo = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

export function AdminOverviewPage() {
  const { locale } = useLocale();
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const since = sevenDaysAgo();
        const since24 = twentyFourHoursAgo();
        const [pub, new7, users, newUsers, reports, feedback, orders, csat, logins24, visits24] = await Promise.all([
          supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('listings').select('id', { count: 'exact', head: true }).gte('created_at', since),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since),
          supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
          supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('feedback').select('rating').eq('type', 'csat').not('rating', 'is', null).limit(500),
          supabase.from('login_events').select('id', { count: 'exact', head: true }).gte('created_at', since24),
          supabase.from('visit_events').select('id', { count: 'exact', head: true }).gte('created_at', since24),
        ]);

        if (cancelled) return;

        const ratings = (csat.data ?? []).map((r: { rating: number | null }) => r.rating).filter((r): r is number => r != null);
        const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

        setKpis({
          publishedListings: pub.count ?? 0,
          newListings7d: new7.count ?? 0,
          totalUsers: users.count ?? 0,
          newUsers7d: newUsers.count ?? 0,
          openReports: reports.count ?? 0,
          newFeedback: feedback.count ?? 0,
          pendingOrders: orders.count ?? 0,
          csatAvg: avg,
          logins24h: logins24.count ?? 0,
          visits24h: visits24.count ?? 0,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : bi(locale, 'تعذر تحميل المؤشرات', "Couldn't load KPIs"));
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{bi(locale, 'نظرة عامة', 'Overview')}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {bi(locale, 'المؤشرات الرئيسية للمنصة (آخر 7 أيام).', 'Key platform metrics (last 7 days).')}
      </p>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">{error}</div>
      )}

      {!kpis ? (
        <div className="text-gray-500 dark:text-gray-400">{bi(locale, 'جارٍ التحميل...', 'Loading...')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            icon={Package}
            label={bi(locale, 'إعلانات منشورة', 'Published listings')}
            value={kpis.publishedListings}
            delta={bi(locale, `${kpis.newListings7d} جديد`, `${kpis.newListings7d} new`)}
            accent="emerald"
          />
          <KpiCard
            icon={Users}
            label={bi(locale, 'إجمالي المستخدمين', 'Total users')}
            value={kpis.totalUsers}
            delta={bi(locale, `${kpis.newUsers7d} هذا الأسبوع`, `${kpis.newUsers7d} this week`)}
            accent="sky"
          />
          <KpiCard icon={ShoppingBag} label={bi(locale, 'طلبات قيد المراجعة', 'Pending orders')} value={kpis.pendingOrders} accent="amber" />
          <KpiCard icon={Flag} label={bi(locale, 'بلاغات مفتوحة', 'Open reports')} value={kpis.openReports} accent="rose" />
          <KpiCard icon={MessageSquareWarning} label={bi(locale, 'شكاوى/اقتراحات جديدة', 'New feedback')} value={kpis.newFeedback} accent="purple" />
          <KpiCard
            icon={TrendingUp}
            label={bi(locale, 'متوسط الرضا (CSAT)', 'CSAT average')}
            value={kpis.csatAvg != null ? `${kpis.csatAvg.toFixed(1)} / 5` : '—'}
            accent="emerald"
          />
          <KpiCard
            icon={LogIn}
            label={bi(locale, 'تسجيلات الدخول (24 ساعة)', 'Logins (24h)')}
            value={kpis.logins24h}
            delta={bi(locale, 'من جدول الأحداث', 'From events table')}
            accent="sky"
          />
          <KpiCard
            icon={Eye}
            label={bi(locale, 'زيارات الموقع (24 ساعة)', 'Visits (24h)')}
            value={kpis.visits24h}
            delta={bi(locale, 'من منارة الزيارة', 'From visit beacon')}
            accent="purple"
          />
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  delta?: string;
  accent: 'emerald' | 'sky' | 'amber' | 'rose' | 'purple';
}) {
  const accentMap: Record<typeof accent, string> = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  };
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className={`inline-flex p-2 rounded-lg ${accentMap[accent]} mb-4`}>
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {delta && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{delta}</p>}
    </div>
  );
}
