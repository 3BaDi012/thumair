-- Public bucket for listing photos + RLS on storage.objects
-- Bucket row is also ensured in 0006 for older hosts / schema differences.

do $$
declare
  has_public boolean;
begin
  if exists (select 1 from storage.buckets where id = 'listing-images') then
    return;
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'storage'
      and table_name = 'buckets'
      and column_name = 'public'
  ) into has_public;

  if has_public then
    insert into storage.buckets (id, name, public)
    values ('listing-images', 'listing-images', true);
  else
    insert into storage.buckets (id, name)
    values ('listing-images', 'listing-images');
  end if;
end $$;

drop policy if exists listing_images_storage_select on storage.objects;
create policy listing_images_storage_select
on storage.objects for select
to anon, authenticated
using (bucket_id = 'listing-images');

drop policy if exists listing_images_storage_insert on storage.objects;
create policy listing_images_storage_insert
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and exists (
    select 1
    from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and public.is_org_manager(l.org_id)
  )
);

drop policy if exists listing_images_storage_delete on storage.objects;
create policy listing_images_storage_delete
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and exists (
    select 1
    from public.listings l
    where l.id::text = split_part(name, '/', 1)
      and public.is_org_manager(l.org_id)
  )
);
