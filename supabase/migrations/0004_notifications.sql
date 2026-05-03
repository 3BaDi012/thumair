-- Notifications (V1)

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('message', 'system', 'listing', 'news')),
  title text not null,
  content text not null,
  link_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_created_at_idx
on public.notifications (recipient_user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_self on public.notifications;
create policy notifications_select_self
on public.notifications
for select
to authenticated
using (recipient_user_id = auth.uid());

drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self
on public.notifications
for update
to authenticated
using (recipient_user_id = auth.uid())
with check (recipient_user_id = auth.uid());

grant select, update on public.notifications to authenticated;

