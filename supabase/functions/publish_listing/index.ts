import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersForRequest } from '../_shared/cors.ts';
import { checkRateLimit, clientKeyFromRequest } from '../_shared/rateLimit.ts';

type Body = {
  listingId: string;
};

Deno.serve(async (req) => {
  const cors = corsHeadersForRequest(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: 'Unauthorized' }, 401, cors);
    }

    if (!userData.user.email_confirmed_at) {
      return json({ error: 'EMAIL_VERIFICATION_REQUIRED' }, 403, cors);
    }

    const rlOk = await checkRateLimit(admin, {
      bucket: 'publish_listing',
      key: clientKeyFromRequest(req, userData.user.id),
      max: 60,
      windowSec: 3600,
    });
    if (!rlOk) return json({ error: 'Too many requests' }, 429, cors);

    const { listingId } = (await req.json()) as Body;
    if (!listingId) {
      return json({ error: 'Missing listingId' }, 400, cors);
    }

    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, title, org_id, status')
      .eq('id', listingId)
      .maybeSingle();

    if (listingError || !listing) {
      return json({ error: 'Listing not found' }, 404, cors);
    }

    if (!listing.title) {
      return json({ error: 'Listing title required' }, 422, cors);
    }

    const { data: images, error: imagesError } = await admin
      .from('listing_images')
      .select('id')
      .eq('listing_id', listingId)
      .limit(1);

    if (imagesError) throw imagesError;
    if (!images || images.length === 0) {
      return json({ error: 'At least one image required to publish' }, 422, cors);
    }

    const { error: updateError } = await admin
      .from('listings')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', listingId);

    if (updateError) throw updateError;

    return json({ ok: true }, 200, cors);
  } catch (e) {
    return json({ error: String(e) }, 500, cors);
  }
});

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
