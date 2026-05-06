import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Search, MapPin, Heart, User } from 'lucide-react';
import { ThumairLogoWithText } from '../components/ThumairLogo';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { NotificationsSidebar } from '../components/NotificationsSidebar';
import { LanguageToggle } from '../components/LanguageToggle';
import { NotificationBell } from '../components/NotificationBell';
import { supabase } from '../lib/supabaseClient';
import type { ListingSummary } from '../context/FavoritesContext';
import { useT } from '../i18n/useT';
import { CATEGORIES } from '../lib/categories';

export function ProductsPage() {
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'الكل');
  const [priceRange, setPriceRange] = useState('all');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { user, isAuthenticated } = useAuth();
  const { t, locale } = useT();

  const dashboardPath = useMemo(() => {
    if (!user?.userType) return '/welcome';
    return user.userType === 'buyer' ? '/dashboard/buyer' : '/dashboard/farmer';
  }, [user?.userType]);

  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, category, city, price_min, price_max, currency, unit, organizations(name), listing_images(storage_path, sort_order)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(100);

      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        setListings([]);
        setIsLoading(false);
        return;
      }

      const mapped: ListingSummary[] =
        (data ?? []).map((row: unknown) => {
          const r = row as {
            id: string;
            title: string;
            category: string | null;
            city: string | null;
            price_min: number | null;
            price_max: number | null;
            currency: string | null;
            unit: string | null;
            organizations?: { name?: string | null } | null;
            listing_images?: { storage_path: string; sort_order: number }[] | null;
          };
          const images = (r.listing_images ?? []) as { storage_path: string; sort_order: number }[];
          const first = images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
          const imageUrl = first?.storage_path ? supabase.storage.from('listing-images').getPublicUrl(first.storage_path).data.publicUrl : null;
          return {
            id: r.id,
            title: r.title,
            category: r.category ?? null,
            city: r.city ?? null,
            priceMin: r.price_min ?? null,
            priceMax: r.price_max ?? null,
            currency: r.currency ?? 'SAR',
            unit: r.unit ?? null,
            imageUrl,
            orgName: r.organizations?.name ?? null,
          } satisfies ListingSummary;
        });

      setListings(mapped);
      setIsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim();
    return listings.filter((l) => {
      const matchesCategory = selectedCategory === 'الكل' || l.category === selectedCategory;
      const matchesSearch = !q || l.title.includes(q) || (l.orgName?.includes(q) ?? false);
      const price = l.priceMin ?? l.priceMax ?? null;
      const matchesPrice =
        priceRange === 'all' ||
        (price != null && priceRange === 'low' && price < 20) ||
        (price != null && priceRange === 'medium' && price >= 20 && price < 100) ||
        (price != null && priceRange === 'high' && price >= 100);
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [listings, priceRange, searchQuery, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of listings) {
      if (!l.category) continue;
      counts.set(l.category, (counts.get(l.category) ?? 0) + 1);
    }
    return counts;
  }, [listings]);

  const categories = useMemo(() => {
    const total = listings.length;
    return [
      { name: 'الكل', emoji: '🌾', count: total },
      ...CATEGORIES.map((c) => ({
        name: c.name,
        emoji: c.emoji,
        count: categoryCounts.get(c.name) ?? 0,
      })),
    ];
  }, [categoryCounts, listings.length]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/home" className="hover:opacity-80 transition">
            <ThumairLogoWithText />
          </Link>

          <div className="flex items-center gap-4">
            <LanguageToggle />
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  {t('nav.dashboard')}
                </Link>
                <NotificationBell onClick={() => setIsNotificationsOpen(true)} />
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition p-2"
                >
                  <div className="size-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                    <User className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.userType === 'buyer' ? (locale === 'en' ? 'Buyer' : 'مشتري') : user?.userType === 'farmer' ? (locale === 'en' ? 'Farmer' : 'مزارع') : locale === 'en' ? 'Supplier' : 'مورد'}
                    </p>
                  </div>
                </button>
              </>
            ) : (
              <Link to="/login" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-b from-emerald-50 dark:from-emerald-900/20 to-white dark:to-gray-900 py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-emerald-900 dark:text-emerald-400 mb-4">
            {locale === 'en' ? 'Browse products' : 'تصفح المنتجات'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {locale === 'en' ? 'Discover fresh local produce from our farms' : 'اكتشف أفضل المنتجات الزراعية الطازجة من مزارعنا'}
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === 'en' ? 'Search products or farms...' : 'ابحث عن المنتجات أو المزارعين...'}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{locale === 'en' ? 'All prices' : 'جميع الأسعار'}</option>
                <option value="low">{locale === 'en' ? 'Under 20 SAR' : 'أقل من 20 ر.س'}</option>
                <option value="medium">{locale === 'en' ? '20 - 100 SAR' : '20 - 100 ر.س'}</option>
                <option value="high">{locale === 'en' ? 'Over 100 SAR' : 'أكثر من 100 ر.س'}</option>
              </select>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    selectedCategory === cat.name
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                  <span className="text-xs opacity-75">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {locale === 'en' ? (
              <>
                Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredListings.length}</span> products
              </>
            ) : (
              <>
                عرض <span className="font-semibold text-gray-900 dark:text-white">{filteredListings.length}</span> منتج
              </>
            )}
          </p>
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>{locale === 'en' ? 'Newest' : 'الأحدث'}</option>
            <option>{locale === 'en' ? 'Top rated' : 'الأعلى تقييماً'}</option>
            <option>{locale === 'en' ? 'Lowest price' : 'الأقل سعراً'}</option>
            <option>{locale === 'en' ? 'Highest price' : 'الأعلى سعراً'}</option>
          </select>
        </div>

        {loadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            {locale === 'en' ? 'Loading products…' : 'جارٍ تحميل المنتجات...'}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition group"
            >
              <Link to={`/listing/${listing.id}`} className="block">
                <div className="relative h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={listing.imageUrl ?? 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80'}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </Link>
              <div className="p-6">
                <Link to={`/listing/${listing.id}`}>
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{listing.orgName ?? 'مزرعة'}</p>
                  </div>

                  <div className="flex items-center gap-1 mb-3 text-sm">
                    <MapPin className="size-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{listing.city ?? '—'}</span>
                  </div>
                </Link>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link to={`/listing/${listing.id}`}>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {listing.priceMin ?? listing.priceMax ?? '—'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {listing.currency}/{listing.unit ?? 'وحدة'}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (isFavorite(listing.id)) {
                        void removeFromFavorites(listing.id);
                      } else {
                        void addToFavorites(listing);
                      }
                    }}
                    className={`p-2 transition ${
                      isFavorite(listing.id)
                        ? 'text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`size-5 ${isFavorite(listing.id) ? 'fill-red-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {!isLoading && filteredListings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد منتجات تطابق البحث</p>
          </div>
        )}
      </div>

      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationsSidebar isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
}
