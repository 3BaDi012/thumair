import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersForRequest } from '../_shared/cors.ts';
import { checkRateLimit, clientKeyFromRequest } from '../_shared/rateLimit.ts';

type Body = {
  userId: string;
  action: 'ban' | 'unban' | 'suspend';
  reason?: string;
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
    const actorId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const rlOk = await checkRateLimit(admin, {
      bucket: 'admin_ban_user',
      key: clientKeyFromRequest(req, actorId),
      max: 200,
      windowSec: 3600,
    });
    if (!rlOk) return json({ error: 'Too many requests' }, 429, cors);

    const { data: profile, error: pErr } = await admin
      .from('profiles')
      .select('role, status')
      .eq('id', actorId)
      .maybeSingle();

    if (pErr || !profile || !['admin', 'super_admin'].includes(profile.role) || profile.status !== 'active') {
      return json({ error: 'Forbidden: admin role required' }, 403, cors);
    }

    const body = (await req.json()) as Body;
    if (!body.userId || !['ban', 'unban', 'suspend'].includes(body.action)) {
      return json({ error: 'userId and action (ban|unban|suspend) required' }, 400, cors);
    }

    if (body.userId === actorId) {
      return json({ error: 'You cannot ban yourself' }, 400, cors);
    }

    const { data: targetProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', body.userId)
      .maybeSingle();
    if (
      targetProfile &&
      ['admin', 'super_admin'].includes(targetProfile.role) &&
      profile.role !== 'super_admin'
    ) {
      return json({ error: 'Only super_admin can act on admins' }, 403, cors);
    }

    const newStatus = body.action === 'unban' ? 'active' : body.action === 'ban' ? 'banned' : 'suspended';

    const { error: updErr } = await admin
      .from('profiles')
      .update({
        status: newStatus,
        banned_reason: body.action === 'unban' ? null : body.reason ?? null,
        banned_at: body.action === 'unban' ? null : new Date().toISOString(),
      })
      .eq('id', body.userId);

    if (updErr) throw updErr;

    if (body.action !== 'unban') {
      await admin.auth.admin.signOut(body.userId).catch(() => undefined);
    }

    await admin.from('admin_audit_log').insert({
      actor_user_id: actorId,
      action: `user.${body.action}`,
      target_type: 'user',
      target_id: body.userId,
      reason: body.reason ?? null,
    });

    const titleMap: Record<string, string> = {
      ban: 'تم حظر حسابك',
      suspend: 'تم تعليق حسابك مؤقتاً',
      unban: 'تمت إعادة تفعيل حسابك',
    };
    await admin.from('notifications').insert({
      recipient_user_id: body.userId,
      type: 'system',
      title: titleMap[body.action],
      content: body.reason ? `السبب: ${body.reason}` : 'تواصل مع الدعم لمزيد من المعلومات.',
    });

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
