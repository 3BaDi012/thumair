# Launch runbook — Thumair

Operational checklist before pointing a production domain at the app. Mirrors the blocking items in `docs/IMPLEMENTATION_NOTES.md`.

## 1. Apply database migrations

From the repo root, with the Supabase CLI linked to your project:

```bash
supabase db push
```

Or run SQL files in order in the Supabase SQL Editor: `0001` … `0009` (especially `0006`, `0007`, `0008`, `0009` for admin, orders/feedback, admin threads, and analytics/rate limits).

## 2. Deploy Edge Functions

Deploy all functions (existing + new):

```bash
supabase functions deploy publish_listing
supabase functions deploy create_conversation_for_listing
supabase functions deploy admin_remove_listing
supabase functions deploy admin_ban_user
supabase functions deploy admin_broadcast
supabase functions deploy admin_send_message
supabase functions deploy submit_feedback
```

### Required secrets (Supabase Dashboard → Edge Functions → Secrets)

| Secret | Purpose |
|--------|---------|
| `SUPABASE_URL` | Usually auto-provided |
| `SUPABASE_ANON_KEY` | JWT verification in functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin/service operations |
| `ALLOWED_ORIGINS` | Comma-separated web origins for CORS, e.g. `https://app.example.com,http://localhost:5173`. If unset, CORS falls back to `*` (dev only). |

## 3. Promote the first `super_admin`

In SQL (replace UUID with your `auth.users.id`):

```sql
update public.profiles
set role = 'super_admin'
where id = '<your-auth-users-uuid>';
```

Ensure `status = 'active'`.

## 4. Rotate Supabase keys if `.env` was ever exposed

1. In Supabase → Project Settings → API, rotate the **anon** key if it was committed or shared.
2. Update local `.env`, Vercel/hosting env vars, and any CI secrets.
3. Check git history: `git log --all --full-history -- .env` — if `.env` was committed, scrub history (`git filter-repo`) before open-sourcing.

## 5. Frontend environment (Vercel / hosting)

Set at minimum:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Optionally `VITE_SENTRY_DSN` for client error reporting

## 6. Post-deploy smoke tests

- Sign in, open `/admin` as non-admin → blocked.
- As admin: overview KPIs load; broadcast sends; admin message creates thread.
- Buyer: place/view orders on dashboard; CSAT prompt after delivered (if no prior CSAT for that order).
- Contact form submits via `submit_feedback` (rate limited).

## 7. Rollback

- Keep previous Supabase migration snapshots; `supabase db reset` is **destructive** — use only on disposable envs.
- Redeploy previous function revisions from Supabase dashboard if a deploy misbehaves.
