-- Make profiles.user_type immutable once set, and tighten self-update to avoid changing privileged fields.

-- 1) Prevent changing user_type after initial set (unless admin).
create or replace function public.prevent_user_type_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin(auth.uid()) then
    return new;
  end if;

  if old.user_type is not null and new.user_type is distinct from old.user_type then
    raise exception 'user_type is immutable once set';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_user_type_change on public.profiles;
create trigger trg_prevent_user_type_change
before update on public.profiles
for each row
execute function public.prevent_user_type_change();

grant execute on function public.prevent_user_type_change() to authenticated;

-- 2) Tighten self-update policy: allow self update, but require id match AND forbid changing role/status/banned fields.
--    (Admin updates are already allowed by profiles_admin_update in 0006.)
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self_safe
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select p.role from public.profiles p where p.id = auth.uid())
  and status = (select p.status from public.profiles p where p.id = auth.uid())
  and banned_reason is not distinct from (select p.banned_reason from public.profiles p where p.id = auth.uid())
  and banned_at is not distinct from (select p.banned_at from public.profiles p where p.id = auth.uid())
);

