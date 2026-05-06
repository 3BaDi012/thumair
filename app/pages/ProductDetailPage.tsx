import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { MapPin, Star, Heart, Share2, Package, Shield, TrendingUp, User } from 'lucide-react';
import { ThumairLogoWithText } from '../components/ThumairLogo';
import { useAuth } from '../context/AuthContext';
import { useFavorites, type ListingSummary } from '../context/FavoritesContext';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { NotificationsSidebar } from '../components/NotificationsSidebar';
import { supabase } from '../lib/supabaseClient';
import { userFacingFunctionError } from '../lib/functionUserFacingError';
import { NotificationBell } from '../components/NotificationBell';
import { useLocale } from '../context/LocaleContext';
import { bi } from '../i18n/bilingual';
import { categoryLabel } from '../lib/categories';

type ListingDetail = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  city: string | null;
  region: string | null;
  unit: string | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  available_quantity: number | null;
  status: string;
  org_id: string;
  organizations: { name: string | null; city: string | null; bio: string | null; created_at: string } | null;
  listing_images: { storage_path: string; sort_order: number }[];
};

type RatingRow = { id: string; rating: number; comment: string | null; created_at: string; user_id: string };

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { locale } = useLocale();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showContactForm, setShowContactForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<string | null>(null);

  const [conversationError, setConversationError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Rating widget
  const [myRating, setMyRating] = useState<number>(0);
  const [myComment, setMyComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setConversationError(null);
    setError(null);
    setLoading(true);

    async function load() {
      if (!id) return;
      const [{ data: listingData, error: listingErr }, { data: ratingData }] = await Promise.all([
        supabase
          .from('listings')
          .select(
            'id, title, description, category, city, region, unit, price_min, price_max, currency, available_quantity, status, org_id, organizations(name, city, bio, created_at), listing_images(storage_path, sort_order)'
          )
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('listing_ratings')
          .select('id, rating, comment, created_at, user_id')
          .eq('listing_id', id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (cancelled) return;

      if (listingErr) {
        setError(listingErr.message);
        setLoading(false);
        return;
      }
      if (!listingData) {
        setError(bi(locale, 'الإعلان غير موجود.', 'Listing not found.'));
        setLoading(false);
        return;
      }
      setListing(listingData as unknown as ListingDetail);
      setRatings((ratingData ?? []) as RatingRow[]);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">{bi(locale, 'جارٍ تحميل المنتج...', 'Loading product...')}</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error ?? bi(locale, 'تعذر تحميل المنتج', 'Failed to load product')}
          </h1>
          <Link to="/products" className="text-emerald-600 hover:text-emerald-700">
            {bi(locale, 'العودة للمنتجات', 'Back to products')}
          </Link>
        </div>
      </div>
    );
  }

  const images = [...listing.listing_images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const imageUrls = images.map((i) => supabase.storage.from('listing-images').getPublicUrl(i.storage_path).data.publicUrl);
  const ratingAvg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null;
  const priceLabel = listing.price_min ?? listing.price_max ?? null;
  const minOrder = 1;

  const summary: ListingSummary = {
    id: listing.id,
    title: listing.title,
    category: listing.category,
    city: listing.city,
    priceMin: listing.price_min,
    priceMax: listing.price_max,
    currency: listing.currency,
    unit: listing.unit,
    imageUrl: imageUrls[0] ?? null,
    orgName: listing.organizations?.name ?? null,
  };
  const fav = isFavorite(listing.id);

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    setOrderResult(null);
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setOrderResult(bi(locale, 'أدخل كمية صحيحة.', 'Enter a valid quantity.'));
      return;
    }
    setOrderSubmitting(true);
    try {
      const { error: insErr } = await supabase.from('orders').insert({
        buyer_user_id: user!.id,
        listing_id: listing!.id,
        org_id: listing!.org_id,
        quantity,
        unit_price: listing!.price_min ?? listing!.price_max ?? 0,
        currency: listing!.currency,
        notes: orderNotes || null,
      });
      if (insErr) throw insErr;
      setOrderResult(bi(locale, 'تم إرسال طلبك! سيتواصل معك البائع.', 'Your order was sent! The seller will contact you.'));
      setOrderNotes('');
    } catch (e) {
      setOrderResult(e instanceof Error ? e.message : bi(locale, 'تعذر إرسال الطلب', "Couldn't send the order"));
    } finally {
      setOrderSubmitting(false);
    }
  }

  async function submitRating() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (myRating < 1 || myRating > 5) return;
    setRatingSubmitting(true);
    try {
      const { error: upErr } = await supabase
        .from('listing_ratings')
        .upsert(
          { listing_id: listing!.id, user_id: user!.id, rating: myRating, comment: myComment || null },
          { onConflict: 'listing_id,user_id' }
        );
      if (upErr) throw upErr;
      const { data: refreshed } = await supabase
        .from('listing_ratings')
        .select('id, rating, comment, created_at, user_id')
        .eq('listing_id', listing!.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setRatings((refreshed ?? []) as RatingRow[]);
      setMyComment('');
      setMyRating(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : bi(locale, 'تعذر حفظ التقييم', "Couldn't save rating"));
    } finally {
      setRatingSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/home" className="hover:opacity-80 transition">
            <ThumairLogoWithText />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/products" className="text-gray-600 hover:text-emerald-600 transition">
              {bi(locale, 'المنتجات', 'Products')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.userType === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer'}
                  className="text-gray-600 hover:text-emerald-600 transition"
                >
                  {bi(locale, 'لوحة التحكم', 'Dashboard')}
                </Link>
                <NotificationBell onClick={() => setIsNotificationsOpen(true)} />
                <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg transition p-2">
                  <div className="size-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><User className="size-5" /></div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">
                      {user?.userType === 'farmer' ? bi(locale, 'مزارع', 'Farmer') : bi(locale, 'مشتري', 'Buyer')}
                    </p>
                  </div>
                </button>
              </>
            ) : (
              <Link to="/login" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                {bi(locale, 'تسجيل الدخول', 'Log in')}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-4">
          <Link to="/products" className="text-emerald-600 hover:text-emerald-700 text-sm">
            {bi(locale, '← العودة للمنتجات', '← Back to products')}
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {imageUrls.length > 0 ? (
              <>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                  <img src={imageUrls[activeImage] ?? imageUrls[0]} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                {imageUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {imageUrls.map((u, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`size-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${activeImage === i ? 'border-emerald-600' : 'border-gray-200'}`}
                      >
                        <img src={u} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square rounded-xl bg-emerald-50 flex items-center justify-center text-9xl">🌾</div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                {listing.category && (
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full mb-3">
                    {categoryLabel(locale, listing.category)}
                  </span>
                )}
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <p className="text-gray-600 flex items-center gap-2 mb-3">
                  <User className="size-4" />
                  {listing.organizations?.name ?? bi(locale, 'مزرعة', 'Farm')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => (fav ? void removeFromFavorites(listing.id) : void addToFavorites(summary))}
                  className={`p-3 border rounded-lg transition ${fav ? 'border-red-500 text-red-500' : 'border-gray-200 hover:border-emerald-600 hover:text-emerald-600'}`}
                >
                  <Heart className={`size-5 ${fav ? 'fill-red-500' : ''}`} />
                </button>
                <button
                  onClick={() => navigator.share?.({ title: listing.title, url: window.location.href }).catch(() => undefined)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-emerald-600 hover:text-emerald-600 transition"
                >
                  <Share2 className="size-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              {ratingAvg != null ? (
                <div className="flex items-center gap-1">
                  <Star className="size-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-semibold text-gray-900">{ratingAvg.toFixed(1)}</span>
                  <span className="text-gray-500">({ratings.length} {bi(locale, 'تقييم', 'ratings')})</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">{bi(locale, 'لا توجد تقييمات بعد', 'No ratings yet')}</span>
              )}
              {(listing.city || listing.region) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="size-4" />
                  <span className="text-sm">{[listing.city, listing.region].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-bold text-emerald-600">{priceLabel ?? '—'}</span>
                <span className="text-xl text-gray-600">{listing.currency} / {listing.unit ?? bi(locale, 'وحدة', 'unit')}</span>
              </div>
              {listing.available_quantity != null && (
                <p className="text-sm text-emerald-600 font-semibold mt-1">
                  {bi(locale, 'متوفر:', 'Available:')} {listing.available_quantity} {listing.unit ?? ''}
                </p>
              )}
            </div>

            {listing.description && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">{bi(locale, 'الوصف', 'Description')}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Shield className="size-6 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">{bi(locale, 'منتج موثق', 'Verified')}</p>
                </div>
                <div>
                  <Package className="size-6 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">{bi(locale, 'تغليف آمن', 'Safe packaging')}</p>
                </div>
                <div>
                  <TrendingUp className="size-6 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">{bi(locale, 'جودة عالية', 'High quality')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowContactForm((v) => !v)}
                className="w-full py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold text-lg"
              >
                {bi(locale, 'طلب شراء', 'Place an order')}
              </button>
              <button
                onClick={async () => {
                  setConversationError(null);
                  if (!isAuthenticated) {
                    navigate('/login');
                    return;
                  }
                  try {
                    const { data, error } = await supabase.functions.invoke('create_conversation_for_listing', {
                      body: { listingId: id },
                    });
                    if (error) throw error;
                    const conversationId = (data as { conversationId?: string } | null)?.conversationId;
                    if (!conversationId) throw new Error('Conversation not created');
                    navigate(`/messages/${conversationId}`);
                  } catch (e) {
                    setConversationError(await userFacingFunctionError(e, 'create_conversation_for_listing'));
                  }
                }}
                className="w-full py-4 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 transition font-semibold"
              >
                {bi(locale, 'التواصل مع البائع (محادثة)', 'Message the seller')}
              </button>
              {conversationError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{conversationError}</div>
              )}
            </div>

            {showContactForm && (
              <form onSubmit={submitOrder} className="mt-6 p-6 bg-white border-2 border-emerald-200 rounded-xl space-y-4">
                <h3 className="font-bold text-gray-900">{bi(locale, 'إرسال طلب شراء', 'Send an order request')}</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {bi(locale, 'الكمية', 'Quantity')} ({listing.unit ?? bi(locale, 'وحدة', 'unit')})
                  </label>
                  <input
                    type="number"
                    min={minOrder}
                    value={Number.isFinite(quantity) ? quantity : ''}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{bi(locale, 'ملاحظات', 'Notes')}</label>
                  <textarea
                    rows={3}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">{bi(locale, 'الإجمالي', 'Total')}</p>
                    <p className="text-2xl font-bold text-emerald-600">{(quantity * (priceLabel ?? 0)).toFixed(2)} {listing.currency}</p>
                  </div>
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
                  >
                    {orderSubmitting ? bi(locale, 'جارٍ الإرسال...', 'Sending...') : bi(locale, 'إرسال الطلب', 'Send order')}
                  </button>
                </div>
                {orderResult && <p className="text-sm text-emerald-700">{orderResult}</p>}
              </form>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {bi(locale, 'التقييمات', 'Ratings')} ({ratings.length})
          </h2>

          {isAuthenticated && (
            <div className="mb-8 p-4 border border-gray-200 rounded-xl">
              <p className="text-sm font-medium text-gray-700 mb-2">{bi(locale, 'قيّم المنتج', 'Rate this product')}</p>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setMyRating(s)}
                    className="p-1"
                  >
                    <Star className={`size-7 ${s <= myRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                placeholder={bi(locale, 'تعليق (اختياري)', 'Comment (optional)')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
              />
              <button
                onClick={() => void submitRating()}
                disabled={ratingSubmitting || myRating === 0}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm"
              >
                {ratingSubmitting ? bi(locale, 'جارٍ الحفظ...', 'Saving...') : bi(locale, 'إرسال التقييم', 'Submit rating')}
              </button>
            </div>
          )}

          {ratings.length === 0 ? (
            <p className="text-gray-500">{bi(locale, 'لا توجد تقييمات بعد. كن أول من يقيّم!', 'No ratings yet. Be the first to rate!')}</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((r) => (
                <div key={r.id} className="pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`size-4 ${s <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  {r.comment && <p className="text-gray-700 text-sm mb-1">{r.comment}</p>}
                  <p className="text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationsSidebar isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
}
