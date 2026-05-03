import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export type RateLimitParams = {
  bucket: string;
  key: string;
  max: number;
  windowSec: number;
};

/**
 * Returns false when the caller exceeded the limit for the current window.
 * Requires service-role client and `increment_rate_limit` RPC (migration 0009).
 */
export async function checkRateLimit(
  admin: SupabaseClient,
  params: RateLimitParams
): Promise<boolean> {
  const { data, error } = await admin.rpc('increment_rate_limit', {
    p_bucket: params.bucket,
    p_key: params.key,
    p_max: params.max,
    p_window_seconds: params.windowSec,
  });
  if (error) {
    console.error('rate_limit rpc', error);
    return true;
  }
  return data === true;
}

export function clientKeyFromRequest(req: Request, userId: string | null): string {
  if (userId) return `u:${userId}`;
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return `ip:${fwd.split(',')[0]!.trim()}`;
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return `ip:${cf}`;
  return 'ip:unknown';
}
