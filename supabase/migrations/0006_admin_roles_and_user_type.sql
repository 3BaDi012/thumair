-- Admin roles, user_type, banning, soft-delete on listings, admin RLS

-- Profiles: role, user_type, status
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin', 'super_admin'));

alter table public.profiles
  add column if not exists user_type text
    check (user_type in ('buyer', 'farmer', 'supplier'));

alter table public.profiles
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended', 'banned'));

alter table public.profiles
  add column if not exists banned_reason text;

alter table public.profiles
  add column if not exists banned_at timestamptz;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_status_idx on public.profiles (status);

-- is_admin helper (security definer to bypass RLS while checking)
create or replace function public.is_admin(p_uid uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_uid
      and role in ('admin', 'super_admin')
      and status = 'active'
  );
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;

-- Listings: soft delete with reason
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings
  add constraint listings_status_check
  check (status in ('draft', 'published', 'paused', 'archived', 'removed'));

alter table public.listings add column if not exists removed_at timestamptz;
alter table public.listings add column if not exists removed_by uuid references auth.users (id);
alter table public.listings add column if not exists removal_reason text;

-- Profiles: allow self read AND admin read of any profile
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Listings: admins can do anything
drop policy if exists listings_admin_all on public.listings;
create policy listings_admin_all
on public.listings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Public + member view of listings excludes removed unless admin
drop policy if exists listings_select_public_or_member on public.listings;
create policy listings_select_public_or_member
on public.listings
for select
to anon, authenticated
using (
  (status = 'published')
  or public.is_org_member(listings.org_id)
  or public.is_admin()
);

-- Reports: admin select + update (existing policy only allowed insert)
drop policy if exists reports_admin_select on public.reports;
create policy reports_admin_select
on public.reports
for select
to authenticated
using (public.is_admin() or reporter_user_id = auth.uid());

drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update
on public.reports
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, update on public.reports to authenticated;

-- Notifications: admin can insert for any user (system notifications)
drop policy if exists notifications_admin_insert on public.notifications;
create policy notifications_admin_insert
on public.notifications
for insert
to authenticated
with check (public.is_admin());

grant insert on public.notifications to authenticated;

-- Conversations / messages: admin read for moderation
drop policy if exists conversations_admin_select on public.conversations;
create policy conversations_admin_select
on public.conversations
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.conversation_participants p
    where p.conversation_id = conversations.id and p.user_id = auth.uid()
  )
);

drop policy if exists messages_admin_select on public.messages;
create policy messages_admin_select
on public.messages
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.conversation_participants p
    where p.conversation_id = messages.conversation_id and p.user_id = auth.uid()
  )
);
