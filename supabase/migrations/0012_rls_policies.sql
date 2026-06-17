-- 0012_rls_policies.sql
-- Enable Row Level Security on every public table and define access policies.
-- The helper functions from 0011 are SECURITY DEFINER, so policies that read
-- `profiles` (e.g. is_admin()) do not recurse through the profiles policy.
-- Policies are dropped-if-exists first so re-running this migration is safe.

-- ---------------------------------------------------------------------------
-- departments
-- ---------------------------------------------------------------------------
alter table public.departments enable row level security;

drop policy if exists departments_select on public.departments;
create policy departments_select on public.departments
  for select to authenticated
  using (true);

drop policy if exists departments_write on public.departments;
create policy departments_write on public.departments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Read: self, any admin, or a manager viewing their own department.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or (public.current_app_role() = 'manager' and dept = public.current_dept())
  );

-- Update self, but a user may NOT change their own role.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_app_role());

-- Admins may do anything to any profile.
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- permissions
-- ---------------------------------------------------------------------------
alter table public.permissions enable row level security;

drop policy if exists permissions_select on public.permissions;
create policy permissions_select on public.permissions
  for select to authenticated
  using (true);

drop policy if exists permissions_write on public.permissions;
create policy permissions_write on public.permissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- role_permissions
-- ---------------------------------------------------------------------------
alter table public.role_permissions enable row level security;

drop policy if exists role_permissions_select on public.role_permissions;
create policy role_permissions_select on public.role_permissions
  for select to authenticated
  using (true);

drop policy if exists role_permissions_write on public.role_permissions;
create policy role_permissions_write on public.role_permissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- user_permissions
-- ---------------------------------------------------------------------------
alter table public.user_permissions enable row level security;

drop policy if exists user_permissions_select on public.user_permissions;
create policy user_permissions_select on public.user_permissions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists user_permissions_write on public.user_permissions;
create policy user_permissions_write on public.user_permissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- tools
-- ---------------------------------------------------------------------------
alter table public.tools enable row level security;

drop policy if exists tools_select on public.tools;
create policy tools_select on public.tools
  for select to authenticated
  using (public.is_admin() or public.can_user_see_tool(auth.uid(), id));

drop policy if exists tools_write on public.tools;
create policy tools_write on public.tools
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- tool_visibility
-- ---------------------------------------------------------------------------
alter table public.tool_visibility enable row level security;

drop policy if exists tool_visibility_select on public.tool_visibility;
create policy tool_visibility_select on public.tool_visibility
  for select to authenticated
  using (public.is_admin());

drop policy if exists tool_visibility_write on public.tool_visibility;
create policy tool_visibility_write on public.tool_visibility
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- audit_logs  (append-only)
-- ---------------------------------------------------------------------------
alter table public.audit_logs enable row level security;

-- Any signed-in client may insert; the server attributes the actor.
drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs
  for insert to authenticated
  with check (true);

-- Read: self, admins, or managers reading actors in their department.
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (
    actor_id = auth.uid()
    or public.is_admin()
    or (
      public.current_app_role() = 'manager'
      and actor_id in (select id from public.profiles where dept = public.current_dept())
    )
  );

-- No update/delete policies are defined → those operations are denied by RLS.
-- Belt-and-braces: explicitly revoke the grants so the table is append-only.
revoke update, delete on public.audit_logs from authenticated;

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
alter table public.notifications enable row level security;

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = auth.uid() or user_id is null or public.is_admin());

-- A user may mark their own notifications read (update).
drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Only admins may create / broadcast / delete notifications.
drop policy if exists notifications_admin_write on public.notifications;
create policy notifications_admin_write on public.notifications
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- active_sessions
-- ---------------------------------------------------------------------------
alter table public.active_sessions enable row level security;

drop policy if exists active_sessions_select on public.active_sessions;
create policy active_sessions_select on public.active_sessions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists active_sessions_insert_self on public.active_sessions;
create policy active_sessions_insert_self on public.active_sessions
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists active_sessions_update_self on public.active_sessions;
create policy active_sessions_update_self on public.active_sessions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists active_sessions_admin_all on public.active_sessions;
create policy active_sessions_admin_all on public.active_sessions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
