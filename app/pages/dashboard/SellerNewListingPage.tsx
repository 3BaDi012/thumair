import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { ListingForm, type ListingFormValues } from '../../components/listings/ListingForm';

type Org = { id: string; name: string; type: string };

export function SellerNewListingPage() {
  const navigate = useNavigate();
  const { supabaseUser } = useAuth();

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [orgId, setOrgId] = useState<string>('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<ListingFormValues>({
    title: '',
    description: '',
    category: '',
    city: '',
    unit: '',
    priceMin: '',
    priceMax: '',
    currency: 'SAR',
    availableQuantity: '',
  });

  useEffect(() => {
    let cancelled = false;
    async function loadOrgs() {
      if (!supabaseUser) return;
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, type')
        .eq('type', 'farm')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setOrgs((data ?? []) as Org[]);
      if ((data ?? []).length > 0) setOrgId((data ?? [])[0].id);
    }
    void loadOrgs();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser]);

  async function createFarmOrgAndMembership(): Promise<string> {
    if (!supabaseUser) throw new Error('Not authenticated');
    const slug = `farm-${supabaseUser.id.slice(0, 8)}-${Date.now()}`;
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ type: 'farm', name: orgName, slug })
      .select('id, name, type')
      .single();
    if (orgError) throw orgError;

    const { error: memError } = await supabase
      .from('organization_members')
      .insert({ org_id: org.id, user_id: supabaseUser.id, role: 'owner' });
    if (memError) throw memError;

    setOrgs((prev) => [org as Org, ...prev]);
    setOrgId(org.id);
    return org.id as string;
  }

  async function onCreateDraft() {
    setError(null);
    if (!values.title.trim()) {
      setError('أدخل عنوان الإعلان');
      return;
    }
    setLoading(true);
    try {
      let effectiveOrgId = orgId;
      if (!effectiveOrgId) {
        if (!orgName.trim()) throw new Error('أدخل اسم المزرعة أولاً');
        effectiveOrgId = await createFarmOrgAndMembership();
      }

      const priceMin = values.priceMin.trim() ? Number(values.priceMin) : null;
      const priceMax = values.priceMax.trim() ? Number(values.priceMax) : null;
      const availableQuantity = values.availableQuantity.trim() ? Number(values.availableQuantity) : null;

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          org_id: effectiveOrgId,
          title: values.title,
          description: values.description.trim() ? values.description.trim() : null,
          category: values.category || null,
          unit: values.unit.trim() ? values.unit.trim() : null,
          price_min: priceMin,
          price_max: priceMax,
          currency: values.currency || 'SAR',
          available_quantity: availableQuantity,
          city: values.city.trim() ? values.city.trim() : null,
          status: 'draft',
        })
        .select('id')
        .single();

      if (listingError) throw listingError;
      navigate(`/dashboard/listings/${listing.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر إنشاء الإعلان');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">إضافة إعلان جديد</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">سيتم حفظه كمسودة أولاً.</p>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-5">
          {orgs.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">المزرعة</label>
              <select
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
              >
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">اسم المزرعة</label>
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="مثال: مزرعة البركة"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">إذا لم تكن لديك مزرعة مسجلة، سننشئ واحدة ونربطك كـ Owner.</p>
            </div>
          )}
          </div>

          <ListingForm values={values} onChange={setValues} />

          <button
            type="button"
            disabled={loading}
            onClick={() => void onCreateDraft()}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? 'جارٍ الإنشاء...' : 'إنشاء مسودة'}
          </button>
        </div>
      </div>
    </div>
  );
}

