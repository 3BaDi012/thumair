-- Fix RLS recursion + ensure anon/auth grants

-- SECURITY DEFINER helpers (owned by migration runner, typically postgres, which bypasses RLS)
create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_manager(p_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  );
$$;

create or replace function public.is_org_owner(p_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
$$;

-- Rewrite policies to use helpers (prevents recursion)
drop policy if exists org_members_select_members on public.organization_members;
create policy org_members_select_members
on public.organization_members
for select
to authenticated
using (public.is_org_member(organization_members.org_id));

-- Allow creating the first owner membership for a newly created org
drop policy if exists org_members_insert_owner on public.organization_members;
create policy org_members_insert_owner
on public.organization_members
for insert
to authenticated
with check (
  organization_members.user_id = auth.uid()
  and organization_members.role = 'owner'
  and exists (select 1 from public.organizations o where o.id = organization_members.org_id)
  and not exists (select 1 from public.organization_members anym where anym.org_id = organization_members.org_id)
);

drop policy if exists org_members_delete_owner on public.organization_members;
create policy org_members_delete_owner
on public.organization_members
for delete
to authenticated
using (public.is_org_owner(organization_members.org_id));

-- Organizations update policy: use helper
drop policy if exists orgs_update_members on public.organizations;
create policy orgs_update_members
on public.organizations
for update
to authenticated
using (public.is_org_manager(organizations.id))
with check (public.is_org_manager(organizations.id));

-- Listings policies: use helpers
drop policy if exists listings_select_public_or_member on public.listings;
create policy listings_select_public_or_member
on public.listings
for select
to anon, authenticated
using (
  status = 'published'
  or public.is_org_member(listings.org_id)
);

drop policy if exists listings_insert_member on public.listings;
create policy listings_insert_member
on public.listings
for insert
to authenticated
with check (public.is_org_manager(listings.org_id));

drop policy if exists listings_update_member on public.listings;
create policy listings_update_member
on public.listings
for update
to authenticated
using (public.is_org_manager(listings.org_id))
with check (public.is_org_manager(listings.org_id));

drop policy if exists listings_delete_member on public.listings;
create policy listings_delete_member
on public.listings
for delete
to authenticated
using (public.is_org_manager(listings.org_id));

-- Listing images select policy: avoid recursive org_members queries
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
        or public.is_org_member(l.org_id)
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
    where l.id = listing_images.listing_id
      and public.is_org_manager(l.org_id)
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
    where l.id = listing_images.listing_id
      and public.is_org_manager(l.org_id)
  )
);

-- GRANTS (fix anon \"permission denied\" and ensure expected access)
grant usage on schema public to anon, authenticated;

grant select on public.organizations to anon;
grant select on public.listings to anon;
grant select on public.listing_images to anon;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.organizations to authenticated;
grant select, insert, delete on public.organization_members to authenticated;
grant select, insert, update, delete on public.listings to authenticated;
grant select, insert, delete on public.listing_images to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert on public.conversations to authenticated;
grant select, insert on public.conversation_participants to authenticated;
grant select, insert on public.messages to authenticated;
grant insert on public.reports to authenticated;

