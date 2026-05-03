import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersForRequest } from '../_shared/cors.ts';
import { checkRateLimit, clientKeyFromRequest } from '../_shared/rateLimit.ts';

type Body = {
  targetUserId: string;
  message: string;
};

type ParticipantRow = { user_id: string };

type ConvoRow = {
  id: string;
  conversation_participants: ParticipantRow[] | null;
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
      bucket: 'admin_send_message',
      key: clientKeyFromRequest(req, userData.user.id),
      max: 120,
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
    if (!body.targetUserId || !body.message?.trim()) {
      return json({ error: 'targetUserId and message required' }, 400, cors);
    }
    if (body.targetUserId === actorId) {
      return json({ error: 'Cannot message yourself' }, 400, cors);
    }

    const { data: target, error: tErr } = await admin.from('profiles').select('id').eq('id', body.targetUserId).maybeSingle();
    if (tErr || !target) return json({ error: 'User not found' }, 404, cors);

    const { data: existing, error: exErr } = await admin
      .from('conversations')
      .select('id, conversation_participants(user_id)')
      .eq('is_admin_thread', true);
    if (exErr) throw exErr;

    const pair = new Set([actorId, body.targetUserId]);
    const rows = (existing ?? []) as ConvoRow[];
    const found = rows.find((c) => {
      const parts = c.conversation_participants ?? [];
      if (parts.length !== 2) return false;
      const uids = new Set(parts.map((p) => p.user_id));
      return pair.size === uids.size && [...pair].every((id) => uids.has(id));
    });

    let conversationId = found?.id;

    if (!conversationId) {
      const { data: convo, error: convoError } = await admin
        .from('conversations')
        .insert({ listing_id: null, is_admin_thread: true })
        .select('id')
        .single();
      if (convoError) throw convoError;
      conversationId = convo.id as string;

      const { error: participantsError } = await admin.from('conversation_participants').insert([
        { conversation_id: conversationId, user_id: actorId, role: 'seller' },
        { conversation_id: conversationId, user_id: body.targetUserId, role: 'buyer' },
      ]);
      if (participantsError) throw participantsError;
    }

    const { error: msgErr } = await admin.from('messages').insert({
      conversation_id: conversationId,
      sender_user_id: actorId,
      body: body.message.trim(),
    });
    if (msgErr) throw msgErr;

    await admin.from('admin_audit_log').insert({
      actor_user_id: actorId,
      action: 'admin.send_message',
      target_type: 'user',
      target_id: body.targetUserId,
      reason: null,
      metadata: { conversation_id: conversationId },
    });

    return json({ ok: true, conversationId }, 200, cors);
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
