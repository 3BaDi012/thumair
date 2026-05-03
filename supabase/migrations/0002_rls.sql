-- RLS policies for Thumair V1

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

-- Profiles: self read/write (can be expanded later)
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Organizations: public read, members manage
drop policy if exists orgs_select_public on public.organizations;
create policy orgs_select_public
on public.organizations
for select
to anon, authenticated
using (true);

drop policy if exists orgs_insert_authenticated on public.organizations;
create policy orgs_insert_authenticated
on public.organizations
for insert
to authenticated
with check (true);

drop policy if exists orgs_update_members on public.organizations;
create policy orgs_update_members
on public.organizations
for update
to authenticated
using (
  exists (
    select 1
    from public.organization_members m
    where m.org_id = organizations.id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.organization_members m
    where m.org_id = organizations.id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  )
);

-- Organization members: members can read; only owners manage
drop policy if exists org_members_select_members on public.organization_members;
create policy org_members_select_members
on public.organization_members
for select
to authenticated
using (
  exists (
    select 1
    from public.organization_members me
    where me.org_id = organization_members.org_id
      and me.user_id = auth.uid()
  )
);

drop policy if exists org_members_insert_owner on public.organization_members;
create policy org_members_insert_owner
on public.organization_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.organization_members me
    where me.org_id = organization_members.org_id
      and me.user_id = auth.uid()
      and me.role = 'owner'
  )
);

drop policy if exists org_members_delete_owner on public.organization_members;
create policy org_members_delete_owner
on public.organization_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.organization_members me
    where me.org_id = organization_members.org_id
      and me.user_id = auth.uid()
      and me.role = 'owner'
  )
);

-- Listings: published public; org members can see all; members manage
drop policy if exists listings_select_public_or_member on public.listings;
create policy listings_select_public_or_member
on public.listings
for select
to anon, authenticated
using (
  status = 'published'
  or exists (
    select 1
    from public.organization_members m
    where m.org_id = listings.org_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists listings_insert_member on public.listings;
create policy listings_insert_member
on public.listings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.organization_members m
    where m.org_id = listings.org_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  )
);

drop policy if exists listings_update_member on public.listings;
create policy listings_update_member
on public.listings
for update
to authenticated
using (
  exists (
    select 1
    from public.organization_members m
    where m.org_id = listings.org_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.organization_members m
    where m.org_id = listings.org_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  )
);

drop policy if exists listings_delete_member on public.listings;
create policy listings_delete_member
on public.listings
for delete
to authenticated
using (
  exists (
    select 1
    from public.organization_members m
    where m.org_id = listings.org_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  )
);

-- Listing images: public if listing published; org members manage
drop policy if exists listing_images_select_public_or_member on public.listing_images;
create policy listing_images_select_public_or_member
on public.listing_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and (
        l.status = 'published'
        or exists (
          select 1
          from public.organization_members m
          where m.org_id = l.org_id
            and m.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists listing_images_insert_member on public.listing_images;
create policy listing_images_insert_member
on public.listing_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.listings l
    join public.organization_members m on m.org_id = l.org_id
    where l.id = listing_images.listing_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  )
);

drop policy if exists listing_images_delete_member on public.listing_images;
create policy listing_images_delete_member
on public.listing_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.listings l
    join public.organization_members m on m.org_id = l.org_id
    where l.id = listing_images.listing_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  )
);

-- Favorites: user only
drop policy if exists favorites_select_self on public.favorites;
create policy favorites_select_self
on public.favorites
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists favorites_insert_self on public.favorites;
create policy favorites_insert_self
on public.favorites
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists favorites_delete_self on public.favorites;
create policy favorites_delete_self
on public.favorites
for delete
to authenticated
using (user_id = auth.uid());

-- Conversations: participant only
drop policy if exists conversations_select_participant on public.conversations;
create policy conversations_select_participant
on public.conversations
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants p
    where p.conversation_id = conversations.id
      and p.user_id = auth.uid()
  )
);

-- Allow creating conversations only via Edge Function (service role) initially.
-- If you want client creation, add a strict insert policy + db constraints.

-- Conversation participants: participant can read; inserts via Edge Function
drop policy if exists convo_participants_select_participant on public.conversation_participants;
create policy convo_participants_select_participant
on public.conversation_participants
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants me
    where me.conversation_id = conversation_participants.conversation_id
      and me.user_id = auth.uid()
  )
);

-- Messages: participant read; participant can send as self
drop policy if exists messages_select_participant on public.messages;
create policy messages_select_participant
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants p
    where p.conversation_id = messages.conversation_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists messages_insert_participant on public.messages;
create policy messages_insert_participant
on public.messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and exists (
    select 1
    from public.conversation_participants p
    where p.conversation_id = messages.conversation_id
      and p.user_id = auth.uid()
  )
);

-- Reports: any authed can insert; select/update reserved for admin via service role (no policy)
drop policy if exists reports_insert_authenticated on public.reports;
create policy reports_insert_authenticated
on public.reports
for insert
to authenticated
with check (reporter_user_id = auth.uid());

