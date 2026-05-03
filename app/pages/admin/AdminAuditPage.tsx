import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type AuditRow = {
  id: number;
  actor_user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export function AdminAuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (cancelled) return;
      if (error) setError(error.message);
      setRows((data ?? []) as AuditRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">سجل التدقيق</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">سجل لكل إجراءات الإدارة (حذف، حظر، إلخ).</p>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">الإجراء</th>
              <th className="p-3 text-right">الهدف</th>
              <th className="p-3 text-right">السبب</th>
              <th className="p-3 text-right">المنفّذ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={5}>جارٍ التحميل...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={5}>لا توجد إدخالات</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="p-3 text-xs text-gray-500">{new Date(r.created_at).toLocaleString('ar-SA')}</td>
                  <td className="p-3 font-mono text-xs">{r.action}</td>
                  <td className="p-3 text-xs">
                    <span className="text-gray-500">{r.target_type}</span>
                    {r.target_id && <span className="text-gray-400"> · {r.target_id.slice(0, 8)}…</span>}
                  </td>
                  <td className="p-3 text-xs text-gray-700 dark:text-gray-300 max-w-md">{r.reason ?? '—'}</td>
                  <td className="p-3 text-xs text-gray-500 font-mono">{r.actor_user_id.slice(0, 8)}…</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
