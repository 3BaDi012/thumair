import { useEffect, useMemo, useState } from 'react';
import { Plus, Package, Eye, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabaseClient';
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

export function FarmerDashboard() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  type ListingRow = {
    id: string;
    title: string;
    category: string | null;
    status: string;
    price_min: number | null;
    price_max: number | null;
    currency: string | null;
    unit: string | null;
    created_at: string;
  };
  type MessageRow = {
    id: string;
    body: string;
    created_at: string;
    conversation_id: string;
  };

  const [listings, setListings] = useState<ListingRow[]>([]);
  const [latestMessages, setLatestMessages] = useState<MessageRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadListings() {
      setError(null);
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, category, status, price_min, price_max, currency, unit, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setListings([]);
        return;
      }
      setListings((data ?? []) as ListingRow[]);
    }
    void loadListings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadLatestMessages() {
      // This works for sellers only if they are conversation participants.
      const { data, error } = await supabase
        .from('messages')
        .select('id, body, created_at, conversation_id')
        .order('created_at', { ascending: false })
        .limit(5);
      if (cancelled) return;
      if (error) return;
      setLatestMessages((data ?? []) as MessageRow[]);
    }
    void loadLatestMessages();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = listings.length;
    const published = listings.filter((l) => l.status === 'published').length;
    return [
      { label: bi(locale, 'إجمالي المنتجات', 'Total listings'), value: String(total), icon: Package, color: 'bg-blue-500' },
      { label: bi(locale, 'المنشور', 'Published'), value: String(published), icon: Eye, color: 'bg-emerald-500' },
      { label: bi(locale, 'المسودات', 'Drafts'), value: String(total - published), icon: Edit, color: 'bg-amber-500' },
      { label: bi(locale, 'الرسائل الأخيرة', 'Latest messages'), value: String(latestMessages.length), icon: MessageSquare, color: 'bg-purple-500' },
    ];
  }, [latestMessages.length, listings]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{bi(locale, 'لوحة التحكم', 'Dashboard')}</h1>
          <p className="text-gray-600 mt-1">{bi(locale, 'مرحباً بك في حسابك', 'Welcome to your account')}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/listings/new')}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="size-5" />
          <span>{bi(locale, 'إضافة منتج جديد', 'Add new listing')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon className="size-6" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{bi(locale, 'منتجاتي', 'My listings')}</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {listings.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition">
                  <div className="text-4xl">🌾</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.title}</h3>
                    <p className="text-sm text-gray-600">{product.category ?? '—'}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-semibold text-emerald-600">
                        {(product.price_min ?? product.price_max ?? '—') + ' ' + (product.currency ?? 'SAR')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${product.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/dashboard/listings/${product.id}/edit`)}
                      className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
              {listings.length === 0 && !error && (
                <div className="text-sm text-gray-600">{bi(locale, 'لا توجد منتجات بعد. اضغط “إضافة منتج جديد”.', 'No listings yet. Click “Add new listing”.')}</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{bi(locale, 'الرسائل الأخيرة', 'Latest messages')}</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {latestMessages.map((m) => (
                <div key={m.id} className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 line-clamp-2">{m.body}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(m.created_at).toLocaleString(locale === 'en' ? 'en-US' : 'ar-SA')}</p>
                </div>
              ))}
              {latestMessages.length === 0 && (
                <div className="text-sm text-gray-600">{bi(locale, 'لا توجد رسائل بعد.', 'No messages yet.')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
