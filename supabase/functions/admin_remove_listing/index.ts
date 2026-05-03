import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersForRequest } from '../_shared/cors.ts';
import { checkRateLimit, clientKeyFromRequest } from '../_shared/rateLimit.ts';

type Body = {
  listingId: string;
  reason: string;
};

Deno.serve(async (req) => {
  const cors = corsHeadersForRequest(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: 'Unauthorized' }, 401, cors);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const rlOk = await checkRateLimit(admin, {
      bucket: 'admin_remove_listing',
      key: clientKeyFromRequest(req, userData.user.id),
      max: 200,
      windowSec: 3600,
    });
    if (!rlOk) return json({ error: 'Too many requests' }, 429, cors);

    const actorId = userData.user.id;

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('role, status')
      .eq('id', actorId)
      .maybeSingle();

    if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role) || profile.status !== 'active') {
      return json({ error: 'Forbidden: admin role required' }, 403, cors);
    }

    const body = (await req.json()) as Body;
    if (!body.listingId || !body.reason || body.reason.trim().length < 3) {
      return json({ error: 'listingId and reason (min 3 chars) are required' }, 400, cors);
    }

    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, title, org_id, status')
      .eq('id', body.listingId)
      .maybeSingle();

    if (listingError || !listing) {
      return json({ error: 'Listing not found' }, 404, cors);
    }

    const { error: updateError } = await admin
      .from('listings')
      .update({
        status: 'removed',
        removed_at: new Date().toISOString(),
        removed_by: actorId,
        removal_reason: body.reason,
      })
      .eq('id', body.listingId);

    if (updateError) throw updateError;

    await admin.from('admin_audit_log').insert({
      actor_user_id: actorId,
      action: 'listing.remove',
      target_type: 'listing',
      target_id: body.listingId,
      reason: body.reason,
      metadata: { previous_status: listing.status, title: listing.title },
    });

    const { data: members } = await admin
      .from('organization_members')
      .select('user_id')
      .eq('org_id', listing.org_id);

    if (members && members.length > 0) {
      const notifications = members.map((m: { user_id: string }) => ({
        recipient_user_id: m.user_id,
        type: 'listing',
        title: 'تم حذف إعلانك',
        content: `الإعلان «${listing.title}» تم حذفه من الإدارة. السبب: ${body.reason}`,
        link_url: null,
      }));
      await admin.from('notifications').insert(notifications);
    }

    return json({ ok: true }, 200, cors);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500, cors);
  }
});

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
