-- Login / visit analytics, rate-limit bucket table (edge functions, service role), feedback.metadata for CSAT linkage

alter table public.feedback add column if not exists metadata jsonb;

-- Login events (client inserts on sign-in)
create table if not exists public.login_events (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists login_events_created_idx on public.login_events (created_at desc);
create index if not exists login_events_user_idx on public.login_events (user_id, created_at desc);

alter table public.login_events enable row level security;

drop policy if exists login_events_insert_self on public.login_events;
create policy login_events_insert_self
on public.login_events
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists login_events_select_admin on public.login_events;
create policy login_events_select_admin
on public.login_events
for select
to authenticated
using (public.is_admin());

grant insert, select on public.login_events to authenticated;

-- Visit events (anon + authed beacon)
create table if not exists public.visit_events (
  id bigserial primary key,
  session_id text,
  path text not null,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists visit_events_created_idx on public.visit_events (created_at desc);

alter table public.visit_events enable row level security;

drop policy if exists visit_events_insert_any on public.visit_events;
create policy visit_events_insert_any
on public.visit_events
for insert
to anon, authenticated
with check (true);

drop policy if exists visit_events_select_admin on public.visit_events;
create policy visit_events_select_admin
on public.visit_events
for select
to authenticated
using (public.is_admin());

grant insert on public.visit_events to anon, authenticated;
grant select on public.visit_events to authenticated;

-- Rate limits (service role only; no grants to anon/authenticated)
create table if not exists public.rate_limits (
  bucket text not null,
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (bucket, key, window_start)
);

create index if not exists rate_limits_window_idx on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;

-- Atomic rate limit check (called from Edge Functions with service role)
create or replace function public.increment_rate_limit(
  p_bucket text,
  p_key text,
  p_max int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ws timestamptz;
  new_count int;
begin
  ws := to_timestamp((extract(epoch from now())::bigint / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits as rl (bucket, key, window_start, count)
  values (p_bucket, p_key, ws, 1)
  on conflict (bucket, key, window_start)
  do update set count = rate_limits.count + 1
  returning count into new_count;
  return new_count <= p_max;
end;
$$;

revoke all on function public.increment_rate_limit(text, text, int, int) from public;
grant execute on function public.increment_rate_limit(text, text, int, int) to service_role;
