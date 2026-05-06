# Thumair Web (V1)

Bridge between farms (sellers) and buyers with listings + favorites + in-app chat (Supabase).

## Prereqs
- Node.js 20+
- A Supabase project (Auth + Database + Storage + Edge Functions)

## Setup
1. Install deps

```bash
npm install
```

2. Create env file

Copy `.env.example` → `.env` and fill:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3. Run dev server

```bash
npm run dev
```

## Deploying to Vercel

If the site shows a **blank white page**, the usual cause is missing **Vite** env vars at build/runtime:

| Variable | Where to copy it |
|----------|-------------------|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key |

In Vercel: **Settings → Environment Variables**. Add both for **Production** (and **Preview** if you use preview deployments). Then **Redeploy**.

Optional: `VITE_SENTRY_DSN` for client error reporting.

The repo includes `vercel.json` with SPA rewrites and security headers. `connect-src` in the CSP allows `https://*.supabase.co` and `wss://*.supabase.co` for Supabase clients.

## Supabase: DB + RLS
- Migrations live in `supabase/migrations/`:
  - `0001_init.sql`: tables + indexes + triggers
  - `0002_rls.sql`: RLS enablement + policies

Apply them using Supabase migrations workflow (CLI or dashboard SQL editor).

## Supabase: Storage
Create buckets:
- `listing-images`
- `avatars`

Then add bucket policies consistent with the RLS model (owners can upload to their listings; published images are public-read).

## Supabase: Edge Functions
Functions (Deno) live in `supabase/functions/`:
- `create_conversation_for_listing`: create/find buyer↔seller conversation for a listing
- `publish_listing`: validates and publishes a listing

Deploy functions using Supabase CLI.

Common error: **“Failed to send a request to the Edge Function”**
- This almost always means the function is **not deployed** (or your project URL/keys are wrong).
- Deploy both functions above, and confirm your `.env` has correct `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

## Verification checklist (V1)
- **Auth**
  - Sign up + sign in works
  - Profile row created in `public.profiles`
- **Listings**
  - Sellers can create draft listings (requires org membership)
  - Public users can only see `status='published'`
  - Search/filter works in `/market`
- **Favorites**
  - Favorites persist in `public.favorites` for authenticated users
  - RLS prevents reading another user’s favorites
- **Chat**
  - Clicking “التواصل مع البائع (محادثة)” invokes `create_conversation_for_listing`
  - Participants can read/send messages; non-participants cannot
  - Realtime is enabled on `public.messages` (server setting)
- **RLS**
  - A non-member cannot read/edit a seller’s drafts
  - A user cannot read conversations they’re not in
- **Performance**
  - `/market` loads within an acceptable time for 100 listings (baseline)
- **Accessibility**
  - Keyboard navigation works for primary flows
  - Contrast acceptable for buttons/links on both light/dark
- **Build**
  - `npm run build` passes

