import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

type ListingRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  org_id: string;
};

export function SellerListingsPage() {
  const { supabaseUser } = useAuth();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabaseUser) {
        setListings([]);
        setLoading(false);
        return;
      }
      setLoading(true);

      const { data: memberships, error: mErr } = await supabase
        .from('organization_members')
        .select('org_id')
        .eq('user_id', supabaseUser.id);

      if (cancelled) return;
      if (mErr) {
        setError(mErr.message);
        setLoading(false);
        return;
      }

      const orgIds = (memberships ?? []).map((m: { org_id: string }) => m.org_id);
      if (orgIds.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      const { data, error: lErr } = await supabase
        .from('listings')
        .select('id, title, status, created_at, org_id')
        .in('org_id', orgIds)
        .order('created_at', { ascending: false })
        .limit(200);

      if (cancelled) return;
      if (lErr) setError(lErr.message);
      setListings((data ?? []) as ListingRow[]);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إعلاناتي</h1>
            <p className="text-gray-600 dark:text-gray-400">إدارة إعلانات مزرعتك (مسودة/منشور).</p>
          </div>
          <Link
            to="/dashboard/listings/new"
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition"
          >
            إضافة إعلان
          </Link>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-3 text-right">العنوان</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">تاريخ الإنشاء</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-6 text-center text-gray-500" colSpan={4}>جارٍ التحميل...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td className="p-6 text-center text-gray-500 dark:text-gray-400" colSpan={4}>لا توجد إعلانات بعد</td></tr>
              ) : (
                listings.map((l) => (
                  <tr key={l.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="p-3">{l.title}</td>
                    <td className="p-3">{l.status}</td>
                    <td className="p-3">{new Date(l.created_at).toLocaleString('ar-SA')}</td>
                    <td className="p-3">
                      <Link to={`/dashboard/listings/${l.id}/edit`} className="text-emerald-700 dark:text-emerald-300 hover:underline">
                        تعديل
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
