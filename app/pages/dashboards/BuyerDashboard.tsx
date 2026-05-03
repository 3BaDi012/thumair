import { Link } from 'react-router';
import { Heart, Package, Clock, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { CsatPrompt } from '../../components/CsatPrompt';

type OrderRow = {
  id: string;
  status: string;
  quantity: number;
  unit_price: number;
  currency: string;
  created_at: string;
  listings: {
    title: string | null;
    listing_images: { storage_path: string }[] | null;
  } | null;
};

const STATUS_AR: Record<string, string> = {
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
  shipped: 'قيد الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغى',
  disputed: 'نزاع',
};

function imageUrlFromListing(row: OrderRow): string | null {
  const paths = row.listings?.listing_images ?? [];
  const first = paths?.[0]?.storage_path;
  if (!first) return null;
  const { data } = supabase.storage.from('listing-images').getPublicUrl(first);
  return data.publicUrl;
}

export function BuyerDashboard() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { supabaseUser } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [csatOrderIds, setCsatOrderIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedCsat, setDismissedCsat] = useState<Set<string>>(new Set());
  const [csatDone, setCsatDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabaseUser) {
        setLoading(false);
        return;
      }
      setError(null);
      const [ordRes, fbRes] = await Promise.all([
        supabase
          .from('orders')
          .select(
            'id, status, quantity, unit_price, currency, created_at, listings(title, listing_images(storage_path))'
          )
          .eq('buyer_user_id', supabaseUser.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('feedback').select('metadata').eq('user_id', supabaseUser.id).eq('type', 'csat'),
      ]);
      if (cancelled) return;
      if (ordRes.error) {
        setError(ordRes.error.message);
        setOrders([]);
      } else {
        setOrders((ordRes.data ?? []) as unknown as OrderRow[]);
      }
      const ids = new Set<string>();
      for (const row of fbRes.data ?? []) {
        const meta = row.metadata as { order_id?: string } | null;
        if (meta?.order_id) ids.add(meta.order_id);
      }
      setCsatOrderIds(ids);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser]);

  const activeOrders = useMemo(
    () => orders.filter((o) => ['pending', 'confirmed', 'shipped'].includes(o.status)).length,
    [orders]
  );
  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'delivered').length, [orders]);

  const pendingCsatOrder = useMemo(() => {
    return orders.find(
      (o) =>
        o.status === 'delivered' &&
        !csatOrderIds.has(o.id) &&
        !dismissedCsat.has(o.id) &&
        !csatDone.has(o.id)
    );
  }, [orders, csatOrderIds, dismissedCsat, csatDone]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مرحباً بك في ثمير</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">تتبع طلباتك وتصفح منتجاتك المفضلة</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300 mb-6">
          {error}
        </div>
      )}

      {pendingCsatOrder && (
        <CsatPrompt
          orderId={pendingCsatOrder.id}
          listingTitle={pendingCsatOrder.listings?.title ?? null}
          onSubmitted={() => {
            setCsatDone((prev) => new Set(prev).add(pendingCsatOrder.id));
            setCsatOrderIds((prev) => new Set(prev).add(pendingCsatOrder.id));
          }}
          onDismiss={() => setDismissedCsat((prev) => new Set(prev).add(pendingCsatOrder.id))}
        />
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm">الطلبات النشطة</p>
              <p className="text-3xl font-bold">{activeOrders}</p>
            </div>
            <div className="size-14 bg-white/20 rounded-full flex items-center justify-center">
              <Package className="size-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm">الطلبات المكتملة</p>
              <p className="text-3xl font-bold">{completedOrders}</p>
            </div>
            <div className="size-14 bg-white/20 rounded-full flex items-center justify-center">
              <Package className="size-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-red-100 text-sm">المنتجات المفضلة</p>
              <p className="text-3xl font-bold">{favorites.length}</p>
            </div>
            <div className="size-14 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="size-7" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="size-6 text-red-500 fill-red-500" />
            المنتجات المفضلة ({favorites.length})
          </h2>
          <Link to="/products" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-semibold">
            تصفح المزيد ←
          </Link>
        </div>
        {favorites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <Heart className="size-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">لا توجد منتجات مفضلة بعد</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">ابدأ بإضافة منتجاتك المفضلة لتظهر هنا</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition group">
                <Link to={`/listing/${product.id}`}>
                  <div className="relative h-48 overflow-hidden rounded-t-xl">
                    <img
                      src={
                        product.imageUrl ??
                        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80'
                      }
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <Link to={`/listing/${product.id}`}>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.orgName ?? 'مزرعة'}</p>
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{product.city ?? '—'}</span>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {product.priceMin ?? product.priceMax ?? '—'} {product.currency}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => void removeFromFavorites(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="إزالة من المفضلة"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <Link
                        to={`/listing/${product.id}`}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
                      >
                        طلب
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="size-6 text-emerald-600 dark:text-emerald-400" />
            طلباتي
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">جارٍ التحميل...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">لا توجد طلبات بعد. تصفح المنتجات وقدّم طلباً.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const img = imageUrlFromListing(order);
                const title = order.listings?.title ?? 'منتج';
                const total = order.quantity * order.unit_price;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="size-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                        {img ? (
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">—</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          الكمية: {order.quantity} × {order.unit_price} {order.currency}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="size-3 shrink-0" />
                          {new Date(order.created_at).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div className="text-left shrink-0 mr-2">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-2 whitespace-nowrap">
                        {total.toLocaleString('ar-SA')} {order.currency}
                      </p>
                      <span
                        className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
                          order.status === 'delivered'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : order.status === 'cancelled'
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        }`}
                      >
                        {STATUS_AR[order.status] ?? order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
