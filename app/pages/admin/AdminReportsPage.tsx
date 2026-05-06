import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

type ReportRow = {
  id: string;
  status: 'open' | 'reviewing' | 'resolved' | 'rejected';
  reason: string;
  details: string | null;
  listing_id: string | null;
  message_id: string | null;
  reporter_user_id: string;
  created_at: string;
};

const STATUSES: ReportRow['status'][] = ['open', 'reviewing', 'resolved', 'rejected'];

export function AdminReportsPage() {
  const { locale } = useLocale();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ReportRow['status']>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    let q = supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(200);
    if (filter !== 'all') q = q.eq('status', filter);
    const { data, error } = await q;
    if (error) setError(error.message);
    setReports((data ?? []) as ReportRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [filter]);

  async function updateStatus(id: string, status: ReportRow['status']) {
    setUpdating(id);
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (error) setError(error.message);
    setUpdating(null);
    await load();
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{bi(locale, 'البلاغات', 'Reports')}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {bi(locale, 'مراجعة البلاغات على الإعلانات والرسائل.', 'Review reports on listings and messages.')}
      </p>

      <div className="flex gap-2 mb-4">
        {(['all', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === s ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {s === 'all' ? bi(locale, 'الكل', 'All') : s}
          </button>
        ))}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-3 text-right">{bi(locale, 'السبب', 'Reason')}</th>
              <th className="p-3 text-right">{bi(locale, 'المرفقات', 'Refs')}</th>
              <th className="p-3 text-right">{bi(locale, 'الحالة', 'Status')}</th>
              <th className="p-3 text-right">{bi(locale, 'التاريخ', 'Date')}</th>
              <th className="p-3 text-right">{bi(locale, 'إجراءات', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={5}>{bi(locale, 'جارٍ التحميل...', 'Loading...')}</td></tr>
            ) : reports.length === 0 ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={5}>{bi(locale, 'لا توجد بلاغات', 'No reports')}</td></tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="p-3 align-top">
                    <p className="font-medium text-gray-900 dark:text-white">{r.reason}</p>
                    {r.details && <p className="text-xs text-gray-500 mt-1 max-w-md">{r.details}</p>}
                  </td>
                  <td className="p-3 text-xs text-gray-500 align-top">
                    {r.listing_id && <p>{bi(locale, 'إعلان:', 'Listing:')} {r.listing_id.slice(0, 8)}…</p>}
                    {r.message_id && <p>{bi(locale, 'رسالة:', 'Message:')} {r.message_id.slice(0, 8)}…</p>}
                  </td>
                  <td className="p-3 align-top"><StatusBadge status={r.status} /></td>
                  <td className="p-3 text-gray-600 dark:text-gray-400 align-top">
                    {new Date(r.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA')}
                  </td>
                  <td className="p-3 align-top">
                    <select
                      value={r.status}
                      disabled={updating === r.id}
                      onChange={(e) => void updateStatus(r.id, e.target.value as ReportRow['status'])}
                      className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-amber-100 text-amber-700',
    reviewing: 'bg-sky-100 text-sky-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
