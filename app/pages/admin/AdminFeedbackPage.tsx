import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

type FeedbackRow = {
  id: string;
  user_id: string | null;
  type: 'complaint' | 'suggestion' | 'csat' | 'nps' | 'general';
  rating: number | null;
  subject: string | null;
  body: string | null;
  email: string | null;
  status: 'new' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
};

const STATUSES: FeedbackRow['status'][] = ['new', 'reviewing', 'resolved', 'dismissed'];
const TYPES: ('all' | FeedbackRow['type'])[] = ['all', 'complaint', 'suggestion', 'csat', 'nps', 'general'];

export function AdminFeedbackPage() {
  const { locale } = useLocale();
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'all' | FeedbackRow['type']>('all');

  async function load() {
    setLoading(true);
    let q = supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(200);
    if (type !== 'all') q = q.eq('type', type);
    const { data, error } = await q;
    if (error) setError(error.message);
    setItems((data ?? []) as FeedbackRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [type]);

  async function updateStatus(id: string, status: FeedbackRow['status']) {
    const { error } = await supabase
      .from('feedback')
      .update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) setError(error.message);
    await load();
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {bi(locale, 'الشكاوى والاقتراحات', 'Feedback')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {bi(locale, 'قراءات الرضا، الشكاوى، والاقتراحات من المستخدمين.', 'CSAT readings, complaints, and suggestions from users.')}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              type === t ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {labelFor(locale, t)}
          </button>
        ))}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      {loading ? (
        <div className="text-gray-500">{bi(locale, 'جارٍ التحميل...', 'Loading...')}</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">{bi(locale, 'لا توجد عناصر', 'No items')}</div>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <TypeBadge locale={locale} type={f.type} />
                  {f.rating != null && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">★ {f.rating}</span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(f.created_at).toLocaleString(locale === 'en' ? 'en-US' : 'ar-SA')}
                  </span>
                </div>
                <select
                  value={f.status}
                  onChange={(e) => void updateStatus(f.id, e.target.value as FeedbackRow['status'])}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {f.subject && <p className="font-semibold text-gray-900 dark:text-white mb-1">{f.subject}</p>}
              {f.body && <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">{f.body}</p>}
              {f.email && <p className="text-xs text-gray-500">{bi(locale, 'البريد:', 'Email:')} {f.email}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function labelFor(locale: 'ar' | 'en', t: string) {
  if (locale === 'en') {
    return (
      ({
        all: 'All',
        complaint: 'Complaints',
        suggestion: 'Suggestions',
        csat: 'CSAT',
        nps: 'NPS',
        general: 'General',
      } as Record<string, string>)[t] ?? t
    );
  }
  return (
    ({
      all: 'الكل',
      complaint: 'شكاوى',
      suggestion: 'اقتراحات',
      csat: 'رضا (CSAT)',
      nps: 'NPS',
      general: 'عام',
    } as Record<string, string>)[t] ?? t
  );
}

function TypeBadge({ locale, type }: { locale: 'ar' | 'en'; type: string }) {
  const map: Record<string, string> = {
    complaint: 'bg-red-100 text-red-700',
    suggestion: 'bg-sky-100 text-sky-700',
    csat: 'bg-emerald-100 text-emerald-700',
    nps: 'bg-purple-100 text-purple-700',
    general: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${map[type] ?? 'bg-gray-100 text-gray-700'}`}>
      {labelFor(locale, type)}
    </span>
  );
}
