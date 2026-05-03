import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersForRequest } from '../_shared/cors.ts';
import { checkRateLimit, clientKeyFromRequest } from '../_shared/rateLimit.ts';

type Audience = 'all' | 'farmers' | 'suppliers' | 'buyers';

type Body = {
  title: string;
  content: string;
  audience: Audience;
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
    if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401, cors);

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const rlOk = await checkRateLimit(admin, {
      bucket: 'admin_broadcast',
      key: clientKeyFromRequest(req, userData.user.id),
      max: 20,
      windowSec: 3600,
    });
    if (!rlOk) return json({ error: 'Too many requests' }, 429, cors);

    const actorId = userData.user.id;
    const { data: profile, error: pErr } = await admin
      .from('profiles')
      .select('role, status')
      .eq('id', actorId)
      .maybeSingle();
    if (pErr || !profile || !['admin', 'super_admin'].includes(profile.role) || profile.status !== 'active') {
      return json({ error: 'Forbidden: admin role required' }, 403, cors);
    }

    const body = (await req.json()) as Body;
    if (!body.title?.trim() || !body.content?.trim()) {
      return json({ error: 'title and content required' }, 400, cors);
    }
    const audience: Audience = ['all', 'farmers', 'suppliers', 'buyers'].includes(body.audience)
      ? body.audience
      : 'all';

    let listQuery = admin.from('profiles').select('id');
    if (audience === 'farmers') listQuery = listQuery.eq('user_type', 'farmer');
    else if (audience === 'suppliers') listQuery = listQuery.eq('user_type', 'supplier');
    else if (audience === 'buyers') listQuery = listQuery.eq('user_type', 'buyer');

    const { data: rows, error: listErr } = await listQuery;
    if (listErr) throw listErr;
    const ids = (rows ?? []).map((r: { id: string }) => r.id).filter(Boolean);
    if (ids.length === 0) return json({ ok: true, sent: 0 }, 200, cors);

    const CHUNK = 500;
    for (let i = 0; i < ids.length; i += CHUNK) {
      const chunk = ids.slice(i, i + CHUNK);
      const notifications = chunk.map((recipient_user_id) => ({
        recipient_user_id,
        type: 'news' as const,
        title: body.title.trim(),
        content: body.content.trim(),
        link_url: null as string | null,
      }));
      const { error: insErr } = await admin.from('notifications').insert(notifications);
      if (insErr) throw insErr;
    }

    await admin.from('admin_audit_log').insert({
      actor_user_id: actorId,
      action: 'admin.broadcast',
      target_type: 'users',
      target_id: null,
      reason: null,
      metadata: { audience, recipient_count: ids.length },
    });

    return json({ ok: true, sent: ids.length }, 200, cors);
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
