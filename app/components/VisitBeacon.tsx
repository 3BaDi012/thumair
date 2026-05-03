import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { supabase } from '../lib/supabaseClient';

const THROTTLE_MS = 60_000;

function visitSessionId(): string {
  const key = 'thumair_visit_sid';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

/**
 * Records anonymous/authenticated page views for admin KPIs (throttled per path per session).
 */
export function VisitBeacon() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    const storageKey = `visit_beacon:${path}`;
    const now = Date.now();
    const prev = sessionStorage.getItem(storageKey);
    if (prev) {
      const t = Number(prev);
      if (!Number.isNaN(t) && now - t < THROTTLE_MS) return;
    }
    sessionStorage.setItem(storageKey, String(now));

    void supabase.from('visit_events').insert({
      session_id: visitSessionId(),
      path,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    });
  }, [location.pathname, location.search]);

  return null;
}
