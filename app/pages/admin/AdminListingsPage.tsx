import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabaseClient';
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

type ListingRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  published_at: string | null;
  org_id: string;
  removal_reason: string | null;
  organizations?: { name: string | null } | null;
};

const STATUSES = ['all', 'draft', 'published', 'paused', 'archived', 'removed'] as const;

export function AdminListingsPage() {
  const { locale } = useLocale();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>('all');
  const [query, setQuery] = useState('');
  const [removeTarget, setRemoveTarget] = useState<ListingRow | null>(null);
  const [reason, setReason] = useState('');
  const [removing, setRemoving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    let q = supabase
      .from('listings')
      .select('id, title, status, created_at, published_at, org_id, removal_reason, organizations(name)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data, error } = await q;
    if (error) setError(error.message);
    setListings((data ?? []) as unknown as ListingRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const s = query.trim();
    if (!s) return listings;
    return listings.filter(
      (l) => l.title.includes(s) || (l.organizations?.name ?? '').includes(s)
    );
  }, [listings, query]);

  async function confirmRemove() {
    if (!removeTarget) return;
    if (reason.trim().length < 3) {
      setError(
        bi(locale, 'يرجى كتابة سبب واضح للحذف (3 أحرف على الأقل).', 'Please provide a clear removal reason (at least 3 characters).')
      );
      return;
    }
    setRemoving(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('admin_remove_listing', {
        body: { listingId: removeTarget.id, reason: reason.trim() },
      });
      if (error) throw error;
      const payload = data as { error?: string } | null;
      if (payload?.error) throw new Error(payload.error);
      setRemoveTarget(null);
      setReason('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : bi(locale, 'تعذر حذف الإعلان', "Couldn't remove listing"));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{bi(locale, 'الإعلانات', 'Listings')}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {bi(locale, 'مراجعة الإعلانات وحذفها مع إشعار صاحب المزرعة بالسبب.', 'Review listings and remove them while notifying the owner with a reason.')}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={bi(locale, 'ابحث بالعنوان أو اسم المزرعة...', 'Search by title or farm name...')}
            className="w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as (typeof STATUSES)[number])}
          className="px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? bi(locale, 'كل الحالات', 'All statuses') : s}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-3 text-right">{bi(locale, 'العنوان', 'Title')}</th>
              <th className="p-3 text-right">{bi(locale, 'المزرعة', 'Farm')}</th>
              <th className="p-3 text-right">{bi(locale, 'الحالة', 'Status')}</th>
              <th className="p-3 text-right">{bi(locale, 'تاريخ الإنشاء', 'Created')}</th>
              <th className="p-3 text-right">{bi(locale, 'إجراءات', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>جارٍ التحميل...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>لا توجد إعلانات</td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="p-3 font-medium text-gray-900 dark:text-white">{l.title}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{l.organizations?.name ?? '—'}</td>
                  <td className="p-3">
                    <StatusBadge status={l.status} />
                    {l.status === 'removed' && l.removal_reason && (
                      <p className="text-xs text-gray-500 mt-1">السبب: {l.removal_reason}</p>
                    )}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">
                    {new Date(l.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/listing/${l.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 text-sm"
                      >
                        <ExternalLink className="size-4" />
                        عرض
                      </Link>
                      {l.status !== 'removed' && (
                        <button
                          onClick={() => {
                            setRemoveTarget(l);
                            setReason('');
                          }}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                        >
                          <Trash2 className="size-4" />
                          حذف
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">حذف الإعلان</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              «{removeTarget.title}» — سيتم إخطار صاحب المزرعة بالسبب.
            </p>
            <label className="block text-sm font-medium mb-2">سبب الحذف</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 mb-4"
              placeholder="مثال: المنتج لا يطابق سياسة المنصة..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRemoveTarget(null);
                  setReason('');
                }}
                disabled={removing}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                إلغاء
              </button>
              <button
                onClick={() => void confirmRemove()}
                disabled={removing}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {removing ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: 'bg-emerald-100 text-emerald-700',
    draft: 'bg-gray-100 text-gray-700',
    paused: 'bg-amber-100 text-amber-700',
    archived: 'bg-slate-100 text-slate-700',
    removed: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
