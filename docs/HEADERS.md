# HTTP security headers

Production uses [vercel.json](../vercel.json) at the repo root so Vercel attaches **HSTS**, **CSP**, **X-Frame-Options**, **Referrer-Policy**, **Permissions-Policy**, and **X-Content-Type-Options** on all routes.

## Adjusting Content-Security-Policy (CSP)

- **Supabase**: `connect-src` includes `https://*.supabase.co` and `wss://*.supabase.co` for REST, Auth, Realtime, and Edge Functions.
- **Sentry**: `connect-src` includes common Sentry ingest host patterns. If your DSN uses another region, add the matching `https://…ingest…sentry.io` host.
- **Google Fonts** (used in [index.html](../index.html)): `style-src` allows `https://fonts.googleapis.com`; `font-src` allows `https://fonts.gstatic.com`.

If you add another API origin (e.g. analytics), extend `connect-src` in `vercel.json` and redeploy.

## Nginx equivalent (snippet)

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
# Mirror the CSP from vercel.json; keep connect-src in sync with your Supabase project host.
```

After changing headers, verify the app in the browser console for CSP violations before rolling out broadly.
