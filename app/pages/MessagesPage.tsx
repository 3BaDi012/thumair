import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

type ConvoRow = {
  id: string;
  listing_id: string | null;
  created_at: string;
  listings?: { title: string | null } | null;
};

export function MessagesPage() {
  const { supabaseUser, isAuthenticated } = useAuth();
  const [convos, setConvos] = useState<ConvoRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabaseUser) {
        setLoading(false);
        return;
      }
      const { data: parts, error: pErr } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', supabaseUser.id);
      if (cancelled) return;
      if (pErr) {
        setError(pErr.message);
        setLoading(false);
        return;
      }
      const ids = (parts ?? []).map((p: { conversation_id: string }) => p.conversation_id);
      if (ids.length === 0) {
        setConvos([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('conversations')
        .select('id, listing_id, created_at, listings(title)')
        .in('id', ids)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) setError(error.message);
      setConvos((data ?? []) as unknown as ConvoRow[]);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">سجّل الدخول لعرض رسائلك.</p>
          <Link to="/login" className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">الرسائل</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">محادثاتك مع البائعين والمشترين.</p>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

        {loading ? (
          <p className="text-gray-500">جارٍ التحميل...</p>
        ) : convos.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <MessageSquare className="size-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">لا توجد محادثات بعد.</p>
            <Link to="/products" className="inline-block mt-4 text-emerald-600 hover:underline">تصفّح المنتجات</Link>
          </div>
        ) : (
          <ul className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {convos.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/messages/${c.id}`}
                  className="block px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {c.listings?.title ?? 'محادثة'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(c.created_at).toLocaleString('ar-SA')}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
