-- 0013_triggers.sql
-- Trigger functions and their bindings:
--   * set_updated_at()        keeps updated_at fresh on mutable tables.
--   * handle_new_user()       mirrors a new auth.users row into public.profiles.
--   * guard_role_escalation() only a super admin may change a profile's role
--                             (server/service-role contexts are exempt).

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists tools_set_updated_at on public.tools;
create trigger tools_set_updated_at
  before update on public.tools
  for each row execute function public.set_updated_at();

drop trigger if exists tool_visibility_set_updated_at on public.tool_visibility;
create trigger tool_visibility_set_updated_at
  before update on public.tool_visibility
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Provision a profile for every new auth user.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dept public.dept_id;
begin
  -- Safely coerce the dept from metadata; default to 'it' if missing/invalid.
  begin
    v_dept := coalesce((new.raw_user_meta_data->>'dept')::public.dept_id, 'it');
  exception when others then
    v_dept := 'it';
  end;

  insert into public.profiles (id, full_name, username, dept, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    v_dept,
    'employee',
    'pending'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Restrict role changes to super admins (server/service-role exempt).
-- ---------------------------------------------------------------------------
create or replace function public.guard_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- No authenticated user → service role / seed script. Allow.
  if auth.uid() is null then
    return new;
  end if;

  if new.role is distinct from old.role
     and public.current_app_role() <> 'super_admin' then
    raise exception 'only super admin may change roles';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_role_escalation on public.profiles;
create trigger profiles_guard_role_escalation
  before update on public.profiles
  for each row execute function public.guard_role_escalation();
