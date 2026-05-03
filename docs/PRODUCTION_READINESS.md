# Thumair — Production Readiness & Admin Spec

Status snapshot of what exists today vs. what must ship before the platform is production-ready. Driven by the client's task list (Arabic, translated below) plus baseline production requirements.

---

## 1. Client Requirements (translated from brief)

| # | Arabic | Required capability |
|---|--------|---------------------|
| 1 | متابعة العمليات اليومية للمنصة | Daily ops dashboard: live counts of listings, orders, logins, site visits |
| 2 | امكانية حذف المنتجات المعروضة و تنبيه صاحب المنتج المحذوف لسبب الحذف | Admin can remove a listing AND notify the owner with a reason |
| 3 | متابعة الشكوى والاقتراحات ومعدل رضا الناس | Track complaints, suggestions, and overall satisfaction (NPS/CSAT) |
| 4 | التواصل مع مستخدمين المنصة | Admin → user direct messaging / broadcast |
| 5 | الاطلاع على المؤشرات (منتجات، مستخدمين جدد، رضا، تقييمات) | KPI dashboard: new listings, new users, satisfaction, ratings |
| 6 | إدارة كاملة للحسابات مع امكانية الحظر | Full account management with ban / suspend |

---

## 2. Current State

**Implemented**
- Auth (Supabase) + profile boot (`app/context/AuthContext.tsx`)
- Public landing, products, product detail, favorites
- Buyer / Farmer / Supplier dashboards (skeleton)
- Seller listings CRUD pages + `publish_listing` edge function
- Conversations + messages with RLS (`supabase/migrations/0002_rls.sql`)
- Notifications table (migration `0004`)
- Admin pages — **stub only**: `AdminListingsPage`, `AdminReportsPage` (read-only tables, no role gating, no actions)

**Critical gaps for production**
- No admin role / RBAC — `/admin/*` routes are reachable by anyone
- No moderation actions (delete listing, ban user, resolve report)
- No KPI aggregation (orders, visits, satisfaction)
- No orders table at all (req #1 mentions الطلبات)
- No surveys / ratings / NPS capture
- No admin → user messaging or broadcast channel
- No audit log of admin actions
- Notifications table exists but no UI / trigger wiring for "your listing was removed because…"

---

## 3. Admin Module — Scope

### 3.1 Access control
- New column `profiles.role text not null default 'user' check (role in ('user','admin','super_admin'))`
- Supabase JWT custom claim `role` populated via auth hook OR an `is_admin()` SQL helper used in RLS
- Route guard `<RequireAdmin>` wrapping all `/admin/*` routes; redirects non-admins to `/`
- Server-side: every admin RLS policy checks `is_admin(auth.uid())` — never trust the client

### 3.2 Pages (all under `/admin`)

| Route | Purpose | Maps to req |
|-------|---------|-------------|
| `/admin` | Overview dashboard — KPI cards + charts | 1, 5 |
| `/admin/listings` | Search / filter / **delete with reason** | 2 |
| `/admin/users` | Search, view profile, **ban / unban**, role change | 6 |
| `/admin/orders` | Order list, status, dispute flag | 1 |
| `/admin/reports` | Complaints queue (open → reviewing → resolved) | 3 |
| `/admin/feedback` | Suggestions + CSAT/NPS responses + trend chart | 3, 5 |
| `/admin/messages` | Inbox of admin↔user threads + broadcast composer | 4 |
| `/admin/audit` | Audit log of every admin action | governance |

### 3.3 Overview KPIs (cards)
- Active listings (today / 7d / 30d delta)
- New users (today / 7d / 30d)
- Logins (24h) — from `auth.audit_log_entries` or custom `login_events`
- Site visits — Plausible / Umami / Vercel Analytics integration
- Open complaints, avg resolution time
- Avg CSAT (last 30d), NPS
- Orders: count, GMV, disputed

---

## 4. Database Changes Required

```sql
-- 4.1 Roles
alter table public.profiles add column role text not null default 'user'
  check (role in ('user','admin','super_admin'));
alter table public.profiles add column status text not null default 'active'
  check (status in ('active','suspended','banned'));
alter table public.profiles add column banned_reason text;
alter table public.profiles add column banned_at timestamptz;

create or replace function public.is_admin(uid uuid) returns boolean
language sql stable as $$
  select exists (select 1 from public.profiles
                 where id = uid and role in ('admin','super_admin'));
$$;

-- 4.2 Soft-delete + reason on listings
alter table public.listings add column removed_at timestamptz;
alter table public.listings add column removed_by uuid references auth.users(id);
alter table public.listings add column removal_reason text;
-- extend status check to include 'removed'

-- 4.3 Orders (new)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid not null references auth.users(id),
  listing_id uuid not null references public.listings(id),
  org_id uuid not null references public.organizations(id),
  quantity numeric not null,
  unit_price numeric not null,
  currency text not null default 'SAR',
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipped','delivered','cancelled','disputed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4.4 Feedback / CSAT / suggestions
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('complaint','suggestion','csat','nps')),
  rating int,            -- 1..5 for CSAT, 0..10 for NPS
  subject text,
  body text,
  status text not null default 'new'
    check (status in ('new','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

-- 4.5 Listing ratings (for req #5 "تقييماتهم")
create table public.listing_ratings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

-- 4.6 Login / visit events
create table public.login_events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  ip inet, user_agent text,
  created_at timestamptz not null default now()
);
create table public.visit_events (
  id bigserial primary key,
  session_id text,
  path text not null,
  referrer text,
  created_at timestamptz not null default now()
);

-- 4.7 Admin audit log
create table public.admin_audit_log (
  id bigserial primary key,
  actor_user_id uuid not null references auth.users(id),
  action text not null,         -- e.g. 'listing.remove','user.ban'
  target_type text not null,    -- 'listing','user','report'
  target_id uuid,
  reason text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- 4.8 Admin RLS — extend existing tables so admins can read/update everything
-- Example for listings:
create policy listings_admin_all on public.listings
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
-- Repeat for: profiles, reports, feedback, orders, conversations, messages.
```

---

## 5. Edge Functions Required

| Function | Purpose |
|----------|---------|
| `admin_remove_listing` | Sets status='removed', writes audit row, inserts notification to owner with reason, optionally emails |
| `admin_ban_user` | Sets profile.status='banned', revokes sessions, audit, notify |
| `admin_broadcast` | Inserts notification rows for all/segmented users |
| `admin_send_message` | Creates a conversation pinned as admin-thread, posts message |
| `record_login_event` | Auth hook → writes `login_events` row |
| `submit_feedback` | Validates + inserts CSAT/NPS/complaint |

All admin functions must verify `is_admin(auth.uid())` server-side before doing anything.

---

## 6. Frontend Work

### Replace stub admin pages
Existing files to flesh out:
- `app/pages/admin/AdminListingsPage.tsx` — add search, status filter, **Remove** button → modal asking reason → calls `admin_remove_listing`
- `app/pages/admin/AdminReportsPage.tsx` — status workflow (open → reviewing → resolved), link to target listing/message

### New pages
- `app/pages/admin/AdminLayout.tsx` — sidebar nav, RTL aware
- `app/pages/admin/AdminOverviewPage.tsx` — KPI cards + recharts (already in deps via `chart.tsx`)
- `app/pages/admin/AdminUsersPage.tsx` — table, profile drawer, ban modal
- `app/pages/admin/AdminOrdersPage.tsx`
- `app/pages/admin/AdminFeedbackPage.tsx`
- `app/pages/admin/AdminMessagesPage.tsx` (reuse `ConversationPage` shell)
- `app/pages/admin/AdminBroadcastPage.tsx`
- `app/pages/admin/AdminAuditPage.tsx`

### Shared components
- `<RequireAdmin>` route guard (read role from `profiles` on boot, cache in `AuthContext`)
- `<KpiCard>`, `<TrendChart>`, `<ConfirmWithReasonDialog>`, `<UserBadge>`
- Notifications bell in header consuming `notifications` table (req #2 owner alert delivery surface)

### Public-side additions feeding admin data
- CSAT modal after order completion / chat closure
- Star rating widget on `ProductDetailPage` writing to `listing_ratings`
- Suggestion / complaint form in footer or `/contact` writing to `feedback`
- Visit beacon (lightweight `fetch('/rpc/visit')`) on route change

---

## 7. Production Hardening (baseline, beyond admin)

### Security
- [ ] Move all secrets out of `.env` committed paths; verify `.env` is gitignored (currently shows as untracked — confirm `.gitignore`)
- [ ] Rotate any keys exposed during development
- [ ] CSP, HSTS, X-Frame-Options, Referrer-Policy headers (Vercel `vercel.json` or hosting equivalent)
- [ ] Rate limiting on edge functions (publish_listing, create_conversation, submit_feedback, login)
- [ ] Re-audit all RLS policies after adding admin role; write SQL tests
- [ ] CAPTCHA / honeypot on register + feedback endpoints
- [ ] Email verification enforced before publishing listings or messaging

### Reliability & Ops
- [ ] Error tracking (Sentry) wired in `app/main.tsx`
- [ ] Structured logging in edge functions
- [ ] Supabase backups verified, PITR enabled
- [ ] Health check endpoint
- [ ] Uptime monitor (BetterStack / UptimeRobot)
- [ ] Staging environment mirroring prod

### Performance
- [ ] Image pipeline: enforce upload size limits, generate thumbnails, serve via Supabase storage transform or CDN
- [ ] Code-split admin bundle (lazy import all `/admin/*` routes)
- [ ] Lighthouse pass: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] DB indexes review (already partially in `0001_init.sql`); add for `orders`, `feedback`, `listing_ratings`

### Compliance & Legal
- [ ] Privacy policy + Terms reviewed by counsel (pages exist as placeholders)
- [ ] Cookie consent banner (KSA PDPL applies)
- [ ] Data export / delete-account flow (PDPL right to erasure)
- [ ] Arabic + English parity on all legal pages

### QA
- [ ] Playwright E2E for: register, publish listing, buyer contacts seller, admin removes listing, admin bans user
- [ ] Unit tests for RLS via `pgTAP` or supabase-js test harness
- [ ] Load test edge functions (k6) at expected peak

### Build / Release
- [ ] CI: typecheck, lint, build, run E2E on PR
- [ ] Pre-deploy migration check (no destructive ops without review)
- [ ] Rollback playbook documented
- [ ] Feature flag mechanism for risky launches

### Observability
- [ ] Plausible/Umami/Vercel Analytics wired (feeds visit KPIs)
- [ ] Supabase dashboard alerts on error rate / slow queries
- [ ] Weekly KPI digest email to client (admin overview snapshot)

---

## 8. Suggested Build Order

1. **DB foundation**: migrations §4.1–4.8
2. **RBAC + route guard** + admin layout
3. **Listings moderation** (req #2) — highest client priority signal
4. **Users + ban** (req #6)
5. **Reports + feedback queue** (req #3)
6. **KPI overview** (req #1, #5) — needs visit/login event capture first
7. **Admin messaging + broadcast** (req #4)
8. **Audit log + notifications UI**
9. **Hardening checklist §7**
10. **E2E + load tests, then ship**

---

## 9. Open Questions for the Client

- Do orders need payment processing in v1, or just intent + offline settlement?
- Should "ban" be permanent, or also a temporary suspend (X days)?
- Does notifying the owner about deletion need email + in-app, or in-app only?
- Required languages for admin UI — Arabic only, or bilingual like the public site?
- Who is the first super_admin — provision via SQL or invite flow?
