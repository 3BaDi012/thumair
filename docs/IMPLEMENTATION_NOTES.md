# Implementation Notes — production hardening pass

Companion to `docs/PRODUCTION_READINESS.md`. This file lists what was done in this pass, the bugs fixed, and what is still required before launch.

## ✅ Done in this pass

### Critical security
- Added `.gitignore` covering `.env`, `node_modules`, `dist`, `tsbuildinfo`, `.cursor/`, `supabase/.temp/`. `.env` was previously tracked; **rotate the Supabase anon key now and remove `.env` from git history if it was ever pushed**.
- `app/lib/supabaseClient.ts` now throws on missing env (was silently constructing a broken client).
- `.env.example` filled with real placeholders.

### Database (new migrations)
- `0006_admin_roles_and_user_type.sql`
  - `profiles.role` (`user`/`admin`/`super_admin`), `user_type`, `status` (`active`/`suspended`/`banned`), `banned_reason`, `banned_at`
  - `is_admin(uid)` security-definer helper
  - Listings: `removed` status, `removed_at`, `removed_by`, `removal_reason`
  - Admin RLS: profiles, listings, reports, notifications, conversations, messages
- `0007_orders_feedback_audit.sql`
  - `orders` (buyer + seller side), `feedback` (complaint/suggestion/csat/nps), `listing_ratings`, `admin_audit_log`
  - `listing_rating_summary` view
  - RLS for all of the above (anon submit feedback, owner submit ratings, admin reads)

### Edge functions
- `admin_remove_listing` — soft-deletes listing, writes audit, notifies all org members with the reason (req #2 ✅)
- `admin_ban_user` — sets profile status, revokes auth sessions, blocks self-target, super_admin guard, writes audit, sends notification (req #6 ✅)

### Admin module
- `<RequireAdmin>` route guard — checks role via `useAuth().isAdmin`, blocks others
- `AdminLayout` with RTL sidebar nav, sign-out, all admin routes nested under `/admin`
- Pages:
  - `/admin` — Overview KPIs (published listings, new listings 7d, users, new users 7d, pending orders, open reports, new feedback, CSAT avg) — req #1, #5 ✅
  - `/admin/listings` — search, status filter, **delete with reason modal** that calls the edge function — req #2 ✅
  - `/admin/users` — search, ban/suspend/unban with reason — req #6 ✅
  - `/admin/orders` — order list with status filter — req #1 ✅
  - `/admin/reports` — status workflow (open/reviewing/resolved/rejected) — req #3 ✅
  - `/admin/feedback` — complaints, suggestions, CSAT, NPS with type filter and status workflow — req #3 ✅
  - `/admin/audit` — admin action log

### AuthContext
- Loads `role`, `status`, `user_type` from profile
- Exposes `isAdmin`, `isLoading`, `refreshProfile`
- Forces sign-out if profile.status is `banned`
- `signUp` now persists `user_type` (was lost before — login/register had a userType picker that wrote nothing)

### Public-side bug fixes
- **`ProductDetailPage` was 100% mock data** (every product showed the same hardcoded تمر سكري). Now loads the real listing, images, ratings from the DB, supports order submission to `orders` table, and a star-rating widget that writes to `listing_ratings`.
- **`SellerListingsPage` showed ALL listings to anyone** (RLS would scope to org members only on `published`/own, but the UI exposed every listing the policy allowed). Now scopes to the current user's organization memberships.
- **`SellerNewListingPage` orgId race**: when no org existed, `setOrgId(...)` was called and then immediately the stale empty `orgId` state was used in the next insert. Fixed by returning the new id from `createFarmOrgAndMembership()` and using a local variable.
- **Empty title on draft create**: now validated.
- **`ContactPage` form did nothing** — just simulated success with `setTimeout`. Now writes to `feedback` table with type derived from subject (complaint/suggestion/general). Submissions feed `/admin/feedback`.
- **`MessagesPage` was a "coming soon" stub** — now lists the user's conversations.
- **`ConversationPage` was a "coming soon" stub** — now full real-time chat using Supabase Realtime channels with INSERT subscriptions.
- New `<NotificationBell>` component: badge count is real (was always-red regardless of unread state) and updates via realtime.

### Build status
- TypeScript: clean.
- Vite production build: green (~720 KB JS gzipped 190 KB; warning about chunk size — see "Still required" below).

## 🛠️ Still required before launch

### Must do (blocking)
1. **Apply migrations 0006 + 0007** to your Supabase project (`supabase db push` or paste into SQL Editor in order).
2. **Deploy the new edge functions**: `admin_remove_listing`, `admin_ban_user`. They rely on `SUPABASE_SERVICE_ROLE_KEY` already configured for existing functions.
3. **Promote the first super_admin** manually in SQL:
   ```sql
   update public.profiles set role = 'super_admin' where id = '<your auth.users.id>';
   ```
4. **Rotate the Supabase anon key** (the live key was committed in `.env`). Generate a new one in the Supabase dashboard → API settings, update local `.env`, and confirm CI/hosting secrets are in sync.
5. Run a one-time check that `.env` is not in git history: `git log --all --full-history -- .env`. If it is, use `git filter-repo` to scrub it before publishing the repo.

### Should do (high impact)
6. Replace the always-red bell `span` in `ProductsPage.tsx` and `ProductDetailPage.tsx` with the new `<NotificationBell>` component. (Already imported pattern shown in `NotificationBell.tsx`.)
7. Code-split admin bundle — wrap `/admin/*` route components in `React.lazy(() => import(...))`. Build warning shows JS at 190 KB gzipped; admin pages are public-bundle weight today.
8. Add Sentry (or similar) in `app/main.tsx`.
9. Email verification enforced before publishing listings or sending messages (Supabase auth setting).
10. Rate limiting on edge functions — at minimum on `submit_feedback` (anon path), `create_conversation_for_listing`, `admin_*`.
11. CSP, HSTS, X-Frame-Options headers on the host (Vercel `vercel.json` or equivalent).

### Nice to have
12. `AdminBroadcastPage` — admin → all users notification (table + insert form).
13. `AdminMessagesPage` — admin↔user direct conversation surface (req #4 partial; today the admin can read any conversation via RLS, but no direct send UI).
14. CSAT modal after order completion (writes type=csat to `feedback`).
15. Visit/login event capture (`login_events`, `visit_events`) for accurate KPI cards (currently the overview shows derived counts but not raw visits).
16. Playwright E2E for: register → publish → buyer order → admin remove → owner sees notification.
17. SQL tests (pgTAP) on the new RLS policies, especially for admin bypass.

## 🐛 Bugs / risks discovered but not yet fixed

| File | Issue | Severity |
|------|-------|----------|
| `app/pages/ProductsPage.tsx` & `ProductDetailPage.tsx` | Hardcoded red bell dot — replace with `<NotificationBell>` | Low |
| `app/pages/LandingPage.tsx`, `dashboards/*.tsx` | Not audited in this pass; may also contain mock data | Medium |
| `supabase/functions/create_conversation_for_listing/index.ts` | Uses `as any` for participant lookup; should be typed | Low |
| `app/context/AuthContext.tsx` | Profile load on every supabaseUser change — fine for now, but cache invalidation on `refreshProfile()` is manual | Low |
| `app/pages/dashboards/FarmerDashboard.tsx` etc. | These exist but were not opened — may have additional mock data | Medium |
| Edge functions accept all origins (`*`) | Lock CORS to your prod domain for production | Medium |
| No reCAPTCHA on register / contact | Anon `feedback` insert path is open — add a honeypot or rate limit | Medium |

## 📐 Where errors are most likely to surface in production

1. **Storage RLS** — image uploads work in dev because the migration `0005`/`0006` create the bucket and policies. If migrations are applied out of order on a fresh project, uploads fail with `bucket not found` — already handled with a friendly message in `SellerEditListingPage`.
2. **Profile insert on signup** — if the `profiles` insert fails after `auth.signUp` succeeds, the user has an auth account but no profile and `loadProfile` falls back. Consider a DB trigger `on auth.users insert → insert profile` for safety.
3. **`admin_remove_listing` notifying members** — if the org has 0 members for any reason, no notifications go out. The audit row still records the action. Acceptable.
4. **`admin_ban_user` revoking sessions** — `auth.admin.signOut()` requires the service role; the function uses it correctly. If the admin Auth API is rate-limited, the catch swallows the error silently to avoid blocking the ban.
5. **Realtime in `ConversationPage`** — relies on Supabase Realtime being enabled for the `messages` table. If disabled, messages still appear after page refresh but not live.
6. **`is_admin()` cache** — the helper is `stable` so within a single statement the result is cached. If you promote a user to admin while they have an active session, they need to refresh to see admin pages (the AuthContext only loads role on supabaseUser change).
7. **Order RLS** — buyers can insert with `buyer_user_id = auth.uid()`. Make sure clients always pass the buyer id from `auth.uid()`, not from a form field.

## 🎯 Mapping to client requirements (from the brief)

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Daily ops monitoring (listings, orders, logins, visits) | ✅ Listings/orders/users/feedback. Logins+visits need event tables (see #15 above). |
| 2 | Delete listing + notify owner with reason | ✅ Full flow shipped |
| 3 | Complaints, suggestions, satisfaction tracking | ✅ Feedback table + admin page + public submit via /contact |
| 4 | Communicate with platform users | 🟡 Admin can read all conversations; UI for admin-initiated messaging is the next step (see #13) |
| 5 | KPI metrics (products, new users, satisfaction, ratings) | ✅ Overview page wired |
| 6 | Full account management with ban | ✅ Ban / suspend / unban with reason and notification |
