import { useEffect, useMemo, useState } from 'react';
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

type ProfileRow = {
  id: string;
  display_name: string;
  phone: string | null;
  user_type: string | null;
  role: string;
  status: string;
  banned_reason: string | null;
  banned_at: string | null;
  created_at: string;
};

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { locale } = useLocale();
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<ProfileRow | null>(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, phone, user_type, role, status, banned_reason, banned_at, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) setError(error.message);
    setUsers((data ?? []) as ProfileRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        u.display_name.toLowerCase().includes(s) ||
        (u.phone ?? '').toLowerCase().includes(s) ||
        u.id.includes(s)
    );
  }, [users, query]);

  async function act(action: 'ban' | 'unban' | 'suspend') {
    if (!target) return;
    if (action !== 'unban' && reason.trim().length < 3) {
      setError(bi(locale, 'يرجى كتابة سبب واضح (3 أحرف على الأقل).', 'Please provide a clear reason (at least 3 characters).'));
      return;
    }
    setActing(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('admin_ban_user', {
        body: { userId: target.id, action, reason: reason.trim() || undefined },
      });
      if (error) throw error;
      const payload = data as { error?: string } | null;
      if (payload?.error) throw new Error(payload.error);
      setTarget(null);
      setReason('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : bi(locale, 'تعذر تنفيذ الإجراء', "Couldn't perform action"));
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{bi(locale, 'المستخدمون', 'Users')}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {bi(locale, 'إدارة الحسابات: حظر، تعليق، إعادة تفعيل.', 'Manage accounts: ban, suspend, unban.')}
      </p>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={bi(locale, 'ابحث بالاسم أو الجوال أو المعرّف...', 'Search by name, phone, or ID...')}
          className="w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-3 text-right">{bi(locale, 'الاسم', 'Name')}</th>
              <th className="p-3 text-right">{bi(locale, 'النوع', 'Type')}</th>
              <th className="p-3 text-right">{bi(locale, 'الدور', 'Role')}</th>
              <th className="p-3 text-right">{bi(locale, 'الحالة', 'Status')}</th>
              <th className="p-3 text-right">{bi(locale, 'انضم في', 'Joined')}</th>
              <th className="p-3 text-right">{bi(locale, 'إجراءات', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={6}>{bi(locale, 'جارٍ التحميل...', 'Loading...')}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={6}>{bi(locale, 'لا يوجد مستخدمون', 'No users')}</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="p-3">
                    <p className="font-medium text-gray-900 dark:text-white">{u.display_name}</p>
                    <p className="text-xs text-gray-500">{u.phone ?? '—'}</p>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{u.user_type ?? '—'}</td>
                  <td className="p-3">
                    {u.role !== 'user' ? (
                      <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">{u.role}</span>
                    ) : (
                      <span className="text-gray-500 text-xs">user</span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={u.status} />
                    {u.banned_reason && (
                      <p className="text-xs text-gray-500 mt-1">
                        {bi(locale, 'السبب:', 'Reason:')} {u.banned_reason}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{new Date(u.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA')}</td>
                  <td className="p-3">
                    {u.id === currentUser?.id ? (
                      <span className="text-gray-400 text-xs">—</span>
                    ) : (
                      <button
                        onClick={() => {
                          setTarget(u);
                          setReason('');
                        }}
                        className="text-sky-600 hover:text-sky-700 text-sm"
                      >
                        إدارة
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">إدارة الحساب</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{target.display_name}</p>

            {target.status !== 'active' ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 mb-4">
                الحساب حالياً: <strong>{target.status}</strong>
                {target.banned_reason && <p className="mt-1 text-xs">السبب: {target.banned_reason}</p>}
              </div>
            ) : null}

            {target.status === 'active' && (
              <>
                <label className="block text-sm font-medium mb-2">السبب</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 mb-4"
                  placeholder="مطلوب — سيتم إرساله للمستخدم في إشعار."
                />
              </>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => {
                  setTarget(null);
                  setReason('');
                }}
                disabled={acting}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              >
                إغلاق
              </button>
              {target.status === 'active' ? (
                <>
                  <button
                    onClick={() => void act('suspend')}
                    disabled={acting}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    <ShieldAlert className="size-4" />
                    تعليق
                  </button>
                  <button
                    onClick={() => void act('ban')}
                    disabled={acting}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <ShieldAlert className="size-4" />
                    حظر
                  </button>
                </>
              ) : (
                <button
                  onClick={() => void act('unban')}
                  disabled={acting}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <ShieldCheck className="size-4" />
                  إعادة تفعيل
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    suspended: 'bg-amber-100 text-amber-700',
    banned: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
