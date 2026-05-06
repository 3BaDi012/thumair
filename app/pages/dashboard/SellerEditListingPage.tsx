import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ImagePlus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { userFacingFunctionError } from '../../lib/functionUserFacingError';
import { LISTING_IMAGES_BUCKET, publicUrlForListingImage } from '../../lib/listingImageStorage';
import { ListingForm, type ListingFormValues } from '../../components/listings/ListingForm';

type Listing = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  unit: string | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  available_quantity: number | null;
  status: string;
  city: string | null;
};

type ListingImageRow = {
  id: string;
  storage_path: string;
  sort_order: number;
};

export function SellerEditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<ListingImageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formValues, setFormValues] = useState<ListingFormValues | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      const { data, error: qErr } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
      if (cancelled) return;
      if (qErr) setError(qErr.message);
      setListing((data ?? null) as Listing | null);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!listing) return;
    setFormValues({
      title: listing.title ?? '',
      description: listing.description ?? '',
      category: listing.category ?? '',
      city: listing.city ?? '',
      unit: listing.unit ?? '',
      priceMin: listing.price_min != null ? String(listing.price_min) : '',
      priceMax: listing.price_max != null ? String(listing.price_max) : '',
      currency: listing.currency ?? 'SAR',
      availableQuantity: listing.available_quantity != null ? String(listing.available_quantity) : '',
    });
  }, [listing]);

  useEffect(() => {
    const listingId = listing?.id;
    if (!listingId) return;
    let cancelled = false;
    async function loadImages() {
      const { data, error: qErr } = await supabase
        .from('listing_images')
        .select('id, storage_path, sort_order')
        .eq('listing_id', listingId)
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (qErr) {
        setImageError(qErr.message);
        return;
      }
      setImages((data ?? []) as ListingImageRow[]);
    }
    void loadImages();
    return () => {
      cancelled = true;
    };
  }, [listing?.id]);

  async function save() {
    if (!listing || !formValues) return;
    setError(null);
    setSaving(true);
    try {
      const priceMin = formValues.priceMin.trim() ? Number(formValues.priceMin) : null;
      const priceMax = formValues.priceMax.trim() ? Number(formValues.priceMax) : null;
      const availableQuantity = formValues.availableQuantity.trim() ? Number(formValues.availableQuantity) : null;

      const { error: up } = await supabase
        .from('listings')
        .update({
          title: formValues.title,
          description: formValues.description.trim() ? formValues.description.trim() : null,
          category: formValues.category || null,
          unit: formValues.unit.trim() ? formValues.unit.trim() : null,
          price_min: priceMin,
          price_max: priceMax,
          currency: formValues.currency || 'SAR',
          available_quantity: availableQuantity,
          city: formValues.city.trim() ? formValues.city.trim() : null,
        })
        .eq('id', listing.id);
      if (up) throw up;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر الحفظ');
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!listing) return;
    setError(null);
    setPublishing(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('publish_listing', {
        body: { listingId: listing.id },
      });
      if (fnErr) throw fnErr;
      const payload = data as { error?: string } | null | undefined;
      if (payload?.error) throw new Error(payload.error);
      navigate('/dashboard/listings');
    } catch (e) {
      setError(await userFacingFunctionError(e, 'publish_listing'));
    } finally {
      setPublishing(false);
    }
  }

  async function uploadImage(file: File) {
    if (!listing) return;
    setImageError(null);
    if (file.size > 5 * 1024 * 1024) {
      setImageError('حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت).');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext ?? '') ? ext : 'jpg';
      const path = `${listing.id}/${crypto.randomUUID()}.${safeExt}`;
      const { error: upErr } = await supabase.storage.from(LISTING_IMAGES_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (upErr) throw upErr;

      const nextOrder = images.length === 0 ? 0 : Math.max(...images.map((i) => i.sort_order)) + 1;
      const { data: row, error: insErr } = await supabase
        .from('listing_images')
        .insert({ listing_id: listing.id, storage_path: path, sort_order: nextOrder })
        .select('id, storage_path, sort_order')
        .single();
      if (insErr) {
        await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([path]).catch(() => undefined);
        throw insErr;
      }
      setImages((prev) => [...prev, row as ListingImageRow]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const lower = msg.toLowerCase();
      if (lower.includes('bucket not found')) {
        setImageError(
          'مجلد التخزين «listing-images» غير موجود على مشروع Supabase. افتح لوحة المشروع → SQL Editor وشغّل ملفات الهجرة الأحدث (0005 و 0006)، أو من Storage أنشئ دلواً باسم listing-images ثم أعد المحاولة.'
        );
      } else if (lower.includes('duplicate key') || lower.includes('409') || lower.includes('conflict')) {
        setImageError('تعذر رفع الصورة بسبب تعارض/تكرار. أعد المحاولة (قد يحدث هذا مؤقتاً).');
      } else if (lower.includes('row-level security') || lower.includes('rls')) {
        setImageError('لا تملك صلاحية رفع صور لهذا الإعلان. تأكد أنك مالك أو مدير المزرعة المرتبطة.');
      } else if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('timeout')) {
        setImageError('تعذر الاتصال بخدمة التخزين. تحقق من اتصال الإنترنت ثم أعد المحاولة.');
      } else {
        setImageError(msg);
      }
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(img: ListingImageRow) {
    setImageError(null);
    const { error: stErr } = await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([img.storage_path]);
    if (stErr) {
      setImageError(stErr.message);
      return;
    }
    const { error: delErr } = await supabase.from('listing_images').delete().eq('id', img.id);
    if (delErr) {
      setImageError(delErr.message);
      return;
    }
    setImages((prev) => prev.filter((i) => i.id !== img.id));
  }

  if (!listing) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10 text-gray-600 dark:text-gray-400">جارٍ التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-10 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تعديل الإعلان</h1>
            <p className="text-gray-600 dark:text-gray-400">الحالة: {listing.status}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 hover:border-emerald-400 transition disabled:opacity-50"
            >
              {saving ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={() => void publish()}
              disabled={publishing || images.length === 0}
              title={images.length === 0 ? 'أضف صورة واحدة على الأقل قبل النشر' : undefined}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishing ? 'جارٍ النشر...' : 'نشر'}
            </button>
          </div>
        </div>

        {images.length === 0 && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            لنشر الإعلان على المتجر، أضف صورة واحدة على الأقل من القسم أدناه.
          </p>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 mb-4 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">صور المنتج</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              صيغ مدعومة: JPEG أو PNG أو WebP أو GIF — حتى 5 ميجابايت لكل صورة.
            </p>

            {imageError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 mb-4 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
                {imageError}
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-8 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition">
              <ImagePlus className="size-10 text-emerald-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {uploading ? 'جارٍ الرفع...' : 'اضغط لاختيار صورة أو اسحبها هنا'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(ev) => {
                  const f = ev.target.files?.[0];
                  ev.target.value = '';
                  if (f) void uploadImage(f);
                }}
              />
            </label>

            {images.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <li
                    key={img.id}
                    className="relative group rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-square"
                  >
                    <img
                      src={publicUrlForListingImage(img.storage_path)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => void removeImage(img)}
                      className="absolute top-2 end-2 p-2 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      aria-label="حذف الصورة"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {formValues && <ListingForm values={formValues} onChange={setFormValues} />}
      </div>
    </div>
  );
}
