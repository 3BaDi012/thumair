-- Orders, feedback (CSAT/complaints/suggestions), listing ratings, admin audit log

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete restrict,
  org_id uuid not null references public.organizations (id) on delete restrict,
  quantity numeric not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  currency text not null default 'SAR',
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'disputed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_buyer_idx on public.orders (buyer_user_id, created_at desc);
create index if not exists orders_org_idx on public.orders (org_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_listing_idx on public.orders (listing_id);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

alter table public.orders enable row level security;

-- Buyer can read & insert own; org members can read & update; admin all
drop policy if exists orders_select on public.orders;
create policy orders_select
on public.orders
for select
to authenticated
using (
  buyer_user_id = auth.uid()
  or public.is_org_member(org_id)
  or public.is_admin()
);

drop policy if exists orders_insert_buyer on public.orders;
create policy orders_insert_buyer
on public.orders
for insert
to authenticated
with check (buyer_user_id = auth.uid());

drop policy if exists orders_update_member_or_admin on public.orders;
create policy orders_update_member_or_admin
on public.orders
for update
to authenticated
using (public.is_org_manager(org_id) or public.is_admin())
with check (public.is_org_manager(org_id) or public.is_admin());

grant select, insert, update on public.orders to authenticated;

-- Feedback / complaints / suggestions / CSAT / NPS
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  type text not null check (type in ('complaint', 'suggestion', 'csat', 'nps', 'general')),
  rating int check (rating between 0 and 10),
  subject text,
  body text,
  email text,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'resolved', 'dismissed')),
  resolved_by uuid references auth.users (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists feedback_status_idx on public.feedback (status, created_at desc);
create index if not exists feedback_type_idx on public.feedback (type);

alter table public.feedback enable row level security;

-- Anyone (incl. anon) can submit feedback; admin reads/updates
drop policy if exists feedback_insert_anyone on public.feedback;
create policy feedback_insert_anyone
on public.feedback
for insert
to anon, authenticated
with check (
  -- Authenticated must use their own id; anon may submit with null user_id
  (auth.uid() is not null and (user_id = auth.uid() or user_id is null))
  or (auth.uid() is null and user_id is null)
);

drop policy if exists feedback_select_admin_or_self on public.feedback;
create policy feedback_select_admin_or_self
on public.feedback
for select
to authenticated
using (public.is_admin() or user_id = auth.uid());

drop policy if exists feedback_update_admin on public.feedback;
create policy feedback_update_admin
on public.feedback
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant insert on public.feedback to anon, authenticated;
grant select, update on public.feedback to authenticated;

-- Listing ratings (per buyer per listing)
create table if not exists public.listing_ratings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

create index if not exists listing_ratings_listing_idx on public.listing_ratings (listing_id);

alter table public.listing_ratings enable row level security;

drop policy if exists listing_ratings_select_public on public.listing_ratings;
create policy listing_ratings_select_public
on public.listing_ratings
for select
to anon, authenticated
using (true);

drop policy if exists listing_ratings_insert_self on public.listing_ratings;
create policy listing_ratings_insert_self
on public.listing_ratings
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists listing_ratings_update_self on public.listing_ratings;
create policy listing_ratings_update_self
on public.listing_ratings
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists listing_ratings_delete_self_or_admin on public.listing_ratings;
create policy listing_ratings_delete_self_or_admin
on public.listing_ratings
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());

grant select on public.listing_ratings to anon, authenticated;
grant insert, update, delete on public.listing_ratings to authenticated;

-- Admin audit log (insert via edge functions / triggers, read by admin)
create table if not exists public.admin_audit_log (
  id bigserial primary key,
  actor_user_id uuid not null references auth.users (id),
  action text not null,
  target_type text not null,
  target_id uuid,
  reason text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_actor_idx on public.admin_audit_log (actor_user_id, created_at desc);
create index if not exists admin_audit_log_target_idx on public.admin_audit_log (target_type, target_id);
create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists admin_audit_select_admin on public.admin_audit_log;
create policy admin_audit_select_admin
on public.admin_audit_log
for select
to authenticated
using (public.is_admin());

grant select on public.admin_audit_log to authenticated;

-- Convenience view: listing rating aggregates
create or replace view public.listing_rating_summary as
select
  listing_id,
  count(*)::int as rating_count,
  round(avg(rating)::numeric, 2) as rating_avg
from public.listing_ratings
group by listing_id;

grant select on public.listing_rating_summary to anon, authenticated;
