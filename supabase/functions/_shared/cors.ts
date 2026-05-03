/**
 * CORS: echo allowed Origin from request, or first entry in ALLOWED_ORIGINS.
 * Set ALLOWED_ORIGINS in Supabase Edge secrets (comma-separated), e.g.
 * `https://thumair.vercel.app,http://localhost:5173`
 */
export function corsHeadersForRequest(req: Request): Record<string, string> {
  const raw = Deno.env.get('ALLOWED_ORIGINS') ?? '';
  const allowed = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const origin = req.headers.get('Origin');
  let allowOrigin = '';
  if (origin && allowed.includes(origin)) {
    allowOrigin = origin;
  } else if (allowed.length > 0) {
    allowOrigin = allowed[0]!;
  } else {
    allowOrigin = '*';
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}
