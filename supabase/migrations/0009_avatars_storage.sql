-- Public bucket for user avatars + RLS on storage.objects

do $$
declare
  has_public boolean;
begin
  if exists (select 1 from storage.buckets where id = 'avatars') then
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
    values ('avatars', 'avatars', true);
  else
    insert into storage.buckets (id, name)
    values ('avatars', 'avatars');
  end if;
end $$;

-- Anyone can read avatars
drop policy if exists avatars_storage_select on storage.objects;
create policy avatars_storage_select
on storage.objects for select
to anon, authenticated
using (bucket_id = 'avatars');

-- Users can upload/delete only within their own folder: {uid}/...
drop policy if exists avatars_storage_insert_own on storage.objects;
create policy avatars_storage_insert_own
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists avatars_storage_delete_own on storage.objects;
create policy avatars_storage_delete_own
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = auth.uid()::text
);

