import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersForRequest } from '../_shared/cors.ts';
import { checkRateLimit, clientKeyFromRequest } from '../_shared/rateLimit.ts';

type FeedbackType = 'complaint' | 'suggestion' | 'general';

type Body = {
  type: FeedbackType;
  subject: string | null;
  body: string;
  email: string | null;
};

Deno.serve(async (req) => {
  const cors = corsHeadersForRequest(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData.user?.id ?? null;

    const key = clientKeyFromRequest(req, userId);
    const rlOk = await checkRateLimit(admin, {
      bucket: 'submit_feedback',
      key,
      max: userId ? 60 : 20,
      windowSec: 3600,
    });
    if (!rlOk) return json({ error: 'Too many requests' }, 429, cors);

    const body = (await req.json()) as Body;
    if (!body.body?.trim() || body.body.trim().length < 3) {
      return json({ error: 'body required (min 3 chars)' }, 400, cors);
    }
    const t = body.type;
    if (!t || !['complaint', 'suggestion', 'general'].includes(t)) {
      return json({ error: 'type must be complaint|suggestion|general' }, 400, cors);
    }

    const { error: insErr } = await admin.from('feedback').insert({
      user_id: userId,
      type: t,
      subject: body.subject ?? null,
      body: body.body.trim(),
      email: body.email?.trim() || null,
    });
    if (insErr) throw insErr;

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
