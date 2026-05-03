import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type OrderRow = {
  id: string;
  buyer_user_id: string;
  listing_id: string;
  org_id: string;
  quantity: number;
  unit_price: number;
  currency: string;
  status: string;
  created_at: string;
  listings?: { title: string | null } | null;
};

const STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'disputed'] as const;

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let q = supabase
        .from('orders')
        .select('*, listings(title)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (filter !== 'all') q = q.eq('status', filter);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) setError(error.message);
      setOrders((data ?? []) as OrderRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [filter]);

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">الطلبات</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">جميع الطلبات على المنصة.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === s ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {s === 'all' ? 'الكل' : s}
          </button>
        ))}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="p-3 text-right">المنتج</th>
              <th className="p-3 text-right">الكمية</th>
              <th className="p-3 text-right">السعر</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={5}>جارٍ التحميل...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={5}>لا توجد طلبات</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="p-3 font-medium">{o.listings?.title ?? '—'}</td>
                  <td className="p-3">{o.quantity}</td>
                  <td className="p-3">{(o.quantity * o.unit_price).toFixed(2)} {o.currency}</td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">{o.status}</span>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{new Date(o.created_at).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
