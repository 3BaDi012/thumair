import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ImagePlus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { userFacingFunctionError } from '../../lib/functionUserFacingError';
import { LISTING_IMAGES_BUCKET, publicUrlForListingImage } from '../../lib/listingImageStorage';
import { ListingForm, type ListingFormValues } from '../../components/listings/ListingForm';
import { useLocale } from '../../context/LocaleContext';
import { bi } from '../../i18n/bilingual';

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
  const { locale } = useLocale();

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
      setError(e instanceof Error ? e.message : bi(locale, 'تعذر الحفظ', "Couldn't save"));
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
      setImageError(bi(locale, 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت).', 'Image is too large (max 5MB).'));
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
          bi(
            locale,
            'مجلد التخزين «listing-images» غير موجود على مشروع Supabase. افتح لوحة المشروع → SQL Editor وشغّل ملفات الهجرة الأحدث (0005 و 0006)، أو من Storage أنشئ دلواً باسم listing-images ثم أعد المحاولة.',
            'Storage bucket "listing-images" is missing in Supabase. Open the project dashboard → SQL Editor and run the latest migrations (0005 & 0006), or create a bucket named listing-images in Storage and retry.'
          )
        );
      } else if (lower.includes('duplicate key') || lower.includes('409') || lower.includes('conflict')) {
        setImageError(bi(locale, 'تعذر رفع الصورة بسبب تعارض/تكرار. أعد المحاولة (قد يحدث هذا مؤقتاً).', "Upload conflict/duplicate. Please retry (this can be temporary)."));
      } else if (lower.includes('row-level security') || lower.includes('rls')) {
        setImageError(bi(locale, 'لا تملك صلاحية رفع صور لهذا الإعلان. تأكد أنك مالك أو مدير المزرعة المرتبطة.', "You don't have permission to upload images for this listing. Make sure you're the farm owner/admin."));
      } else if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('timeout')) {
        setImageError(bi(locale, 'تعذر الاتصال بخدمة التخزين. تحقق من اتصال الإنترنت ثم أعد المحاولة.', "Couldn't reach storage service. Check your internet and retry."));
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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10 text-gray-600 dark:text-gray-400">
        {bi(locale, 'جارٍ التحميل...', 'Loading...')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-10 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{bi(locale, 'تعديل الإعلان', 'Edit listing')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{bi(locale, 'الحالة:', 'Status:')} {listing.status}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 hover:border-emerald-400 transition disabled:opacity-50"
            >
              {saving ? bi(locale, 'جارٍ الحفظ...', 'Saving...') : bi(locale, 'حفظ', 'Save')}
            </button>
            <button
              type="button"
              onClick={() => void publish()}
              disabled={publishing || images.length === 0}
              title={images.length === 0 ? bi(locale, 'أضف صورة واحدة على الأقل قبل النشر', 'Add at least one image before publishing') : undefined}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishing ? bi(locale, 'جارٍ النشر...', 'Publishing...') : bi(locale, 'نشر', 'Publish')}
            </button>
          </div>
        </div>

        {images.length === 0 && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            {bi(locale, 'لنشر الإعلان على المتجر، أضف صورة واحدة على الأقل من القسم أدناه.', 'To publish this listing, add at least one image below.')}
          </p>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 mb-4 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{bi(locale, 'صور المنتج', 'Product images')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {bi(locale, 'صيغ مدعومة: JPEG أو PNG أو WebP أو GIF — حتى 5 ميجابايت لكل صورة.', 'Supported: JPEG, PNG, WebP, GIF — up to 5MB per image.')}
            </p>

            {imageError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 mb-4 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
                {imageError}
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-8 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition">
              <ImagePlus className="size-10 text-emerald-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {uploading ? bi(locale, 'جارٍ الرفع...', 'Uploading...') : bi(locale, 'اضغط لاختيار صورة أو اسحبها هنا', 'Click to choose an image or drag it here')}
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
                      aria-label={bi(locale, 'حذف الصورة', 'Delete image')}
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
