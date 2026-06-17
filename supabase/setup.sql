-- ============================================================
-- AOI Team Hub — combined bootstrap (all migrations + seed)
-- Generated from supabase/migrations/*.sql + supabase/seed.sql
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Idempotent: safe to re-run.
-- ============================================================


-- ─────────────────────────────────────────────────────────
-- 0001_extensions.sql
-- ─────────────────────────────────────────────────────────
-- 0001_extensions.sql
-- Enable the Postgres extensions the rest of the schema relies on.
-- pgcrypto provides gen_random_uuid(); uuid-ossp is kept for compatibility.

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";


-- ─────────────────────────────────────────────────────────
-- 0002_enums.sql
-- ─────────────────────────────────────────────────────────
-- 0002_enums.sql
-- Domain enums mirroring src/lib/repositories/types.ts (Role, DeptId, AuditAction).
-- Each type is created only when it does not already exist so re-running is safe.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('super_admin', 'admin', 'manager', 'employee');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'dept_id') then
    create type public.dept_id as enum (
      'sales',
      'operations',
      'customer_service',
      'logistics',
      'hr',
      'finance',
      'marketing',
      'it'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'audit_action') then
    create type public.audit_action as enum (
      'login',
      'logout',
      'login_failed',
      'register',
      'permission_change',
      'visibility_change',
      'tool_access',
      'user_create',
      'user_update',
      'user_disable',
      'role_change',
      'admin_action'
    );
  end if;
end
$$;


-- ─────────────────────────────────────────────────────────
-- 0003_departments.sql
-- ─────────────────────────────────────────────────────────
-- 0003_departments.sql
-- The departments reference table. Rows are seeded from
-- src/lib/constants/departments.ts via supabase/seed.sql.

create table if not exists public.departments (
  id         public.dept_id primary key,
  code       text not null,
  name_en    text not null,
  name_ar    text not null,
  color      text not null,
  icon       text not null,
  blurb_en   text not null default '',
  blurb_ar   text not null default '',
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────
-- 0004_profiles.sql
-- ─────────────────────────────────────────────────────────
-- 0004_profiles.sql
-- User profiles, one row per auth.users record (1:1). The id is the auth uid.
-- Mirrors the Profile model in src/lib/repositories/types.ts.

create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  full_name             text not null default '',
  username              text unique,
  dept                  public.dept_id references public.departments(id),
  role                  public.app_role not null default 'employee',
  status                text not null default 'active' check (status in ('active', 'disabled', 'pending')),
  must_change_password  boolean not null default false,
  mfa_enabled           boolean not null default false,
  locale                text not null default 'ar' check (locale in ('ar', 'en')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  last_login_at         timestamptz
);

create index if not exists profiles_dept_idx on public.profiles (dept);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_status_idx on public.profiles (status);


-- ─────────────────────────────────────────────────────────
-- 0005_permissions.sql
-- ─────────────────────────────────────────────────────────
-- 0005_permissions.sql
-- The permission catalog plus the role→permission matrix and per-user overrides.
-- Seeded from src/lib/rbac/permissions.ts (PERMISSIONS + ROLE_PERMISSIONS).

create table if not exists public.permissions (
  key         text primary key,
  description text not null default '',
  category    text not null default ''
);

create table if not exists public.role_permissions (
  role           public.app_role not null,
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key (role, permission_key)
);

create table if not exists public.user_permissions (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  "grant"        boolean not null,
  primary key (user_id, permission_key)
);

create index if not exists role_permissions_role_idx on public.role_permissions (role);
create index if not exists user_permissions_user_idx on public.user_permissions (user_id);


-- ─────────────────────────────────────────────────────────
-- 0006_tools.sql
-- ─────────────────────────────────────────────────────────
-- 0006_tools.sql
-- The tool registry. Rows are seeded from src/lib/constants/tools.seed.ts via
-- supabase/seed.sql. Mirrors the Tool model in types.ts.

create table if not exists public.tools (
  id          text primary key,
  dept        public.dept_id references public.departments(id),
  name        text not null,
  version     text not null default '',
  status      text not null default 'soon' check (status in ('live', 'soon')),
  featured    boolean not null default false,
  description text not null default '',
  tags        text[] not null default '{}',
  launch_kind text not null check (launch_kind in ('iframe', 'external', 'route')),
  launch_url  text not null default '',
  min_role    public.app_role not null default 'employee',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tools_dept_idx on public.tools (dept);
create index if not exists tools_status_idx on public.tools (status);


-- ─────────────────────────────────────────────────────────
-- 0007_tool_visibility.sql
-- ─────────────────────────────────────────────────────────
-- 0007_tool_visibility.sql
-- Per-tool visibility overrides scoped to a user, a role, or a department.
-- Exactly one subject column may be set, matching the scope. Precedence at read
-- time (user > role > department) is implemented in can_user_see_tool() (0011).

create table if not exists public.tool_visibility (
  id           uuid primary key default gen_random_uuid(),
  tool_id      text not null references public.tools(id) on delete cascade,
  scope        text not null check (scope in ('user', 'role', 'department')),
  subject_user uuid references public.profiles(id) on delete cascade,
  subject_role public.app_role,
  subject_dept public.dept_id,
  visible      boolean not null default true,
  created_by   uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Exactly the subject column matching the scope must be set, the others null.
  constraint tool_visibility_subject_matches_scope check (
    (scope = 'user'       and subject_user is not null and subject_role is null and subject_dept is null) or
    (scope = 'role'       and subject_role is not null and subject_user is null and subject_dept is null) or
    (scope = 'department' and subject_dept is not null and subject_user is null and subject_role is null)
  )
);

-- One rule per (tool, subject) within each scope.
create unique index if not exists tool_visibility_user_uniq
  on public.tool_visibility (tool_id, subject_user) where scope = 'user';
create unique index if not exists tool_visibility_role_uniq
  on public.tool_visibility (tool_id, subject_role) where scope = 'role';
create unique index if not exists tool_visibility_dept_uniq
  on public.tool_visibility (tool_id, subject_dept) where scope = 'department';

create index if not exists tool_visibility_tool_idx on public.tool_visibility (tool_id);


-- ─────────────────────────────────────────────────────────
-- 0008_audit_logs.sql
-- ─────────────────────────────────────────────────────────
-- 0008_audit_logs.sql
-- Append-only audit trail. Writes are insert-only (enforced via RLS in 0012);
-- update/delete are revoked from authenticated. Mirrors the AuditEntry model.

create table if not exists public.audit_logs (
  id             bigint generated always as identity primary key,
  actor_id       uuid references public.profiles(id) on delete set null,
  actor_username text not null default '',
  action         public.audit_action not null,
  target_type    text,
  target_id      text,
  metadata       jsonb not null default '{}',
  ip             inet,
  user_agent     text,
  created_at     timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_id);
create index if not exists audit_logs_action_idx on public.audit_logs (action);
create index if not exists audit_logs_target_idx on public.audit_logs (target_type, target_id);


-- ─────────────────────────────────────────────────────────
-- 0009_notifications.sql
-- ─────────────────────────────────────────────────────────
-- 0009_notifications.sql
-- In-app notifications. A null user_id is a broadcast to all signed-in users.
-- Bilingual title/body. Mirrors the Notification model in types.ts.

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  type       text not null default 'info',
  title_en   text not null default '',
  title_ar   text not null default '',
  body_en    text not null default '',
  body_ar    text not null default '',
  data       jsonb not null default '{}',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);


-- ─────────────────────────────────────────────────────────
-- 0010_presence_sessions.sql
-- ─────────────────────────────────────────────────────────
-- 0010_presence_sessions.sql
-- Active session tracking for presence / "online now" counts and remote revoke.

create table if not exists public.active_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  started_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ip           inet,
  user_agent   text,
  revoked_at   timestamptz
);

create index if not exists active_sessions_user_idx on public.active_sessions (user_id);
create index if not exists active_sessions_last_seen_idx on public.active_sessions (last_seen_at desc);


-- ─────────────────────────────────────────────────────────
-- 0011_helper_functions.sql
-- ─────────────────────────────────────────────────────────
-- 0011_helper_functions.sql
-- SECURITY DEFINER helpers used by RLS policies. They run with the function
-- owner's privileges and a pinned search_path, so policies can read `profiles`
-- WITHOUT re-triggering the profiles RLS policy (which would otherwise recurse).

-- The role of the currently authenticated user.
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- The department of the currently authenticated user.
create or replace function public.current_dept()
returns public.dept_id
language sql
stable
security definer
set search_path = public
as $$
  select dept from public.profiles where id = auth.uid();
$$;

-- True if the current user is an admin or super admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() in ('super_admin', 'admin'), false);
$$;

-- Numeric privilege rank for a role (higher = more privileged).
create or replace function public.role_rank(r public.app_role)
returns int
language sql
immutable
as $$
  select case r
    when 'employee'    then 1
    when 'manager'     then 2
    when 'admin'       then 3
    when 'super_admin' then 4
    else 0
  end;
$$;

-- Resolve whether a given user may see a given tool.
-- Precedence: user-scoped rule > role-scoped rule > department-scoped rule.
-- If no override matches, fall back to min_role comparison.
create or replace function public.can_user_see_tool(uid uuid, tool text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role    public.app_role;
  v_dept    public.dept_id;
  v_min     public.app_role;
  v_visible boolean;
begin
  select role, dept into v_role, v_dept from public.profiles where id = uid;

  -- Unknown user → not visible.
  if v_role is null then
    return false;
  end if;

  -- 1) User-scoped override (highest precedence).
  select tv.visible into v_visible
  from public.tool_visibility tv
  where tv.tool_id = tool and tv.scope = 'user' and tv.subject_user = uid
  limit 1;
  if found then
    return v_visible;
  end if;

  -- 2) Role-scoped override.
  select tv.visible into v_visible
  from public.tool_visibility tv
  where tv.tool_id = tool and tv.scope = 'role' and tv.subject_role = v_role
  limit 1;
  if found then
    return v_visible;
  end if;

  -- 3) Department-scoped override.
  if v_dept is not null then
    select tv.visible into v_visible
    from public.tool_visibility tv
    where tv.tool_id = tool and tv.scope = 'department' and tv.subject_dept = v_dept
    limit 1;
    if found then
      return v_visible;
    end if;
  end if;

  -- 4) Fallback: user's role must out-rank (or equal) the tool's min_role.
  select min_role into v_min from public.tools where id = tool;
  if v_min is null then
    return false;
  end if;

  return public.role_rank(v_role) >= public.role_rank(v_min);
end;
$$;


-- ─────────────────────────────────────────────────────────
-- 0012_rls_policies.sql
-- ─────────────────────────────────────────────────────────
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


-- ─────────────────────────────────────────────────────────
-- 0013_triggers.sql
-- ─────────────────────────────────────────────────────────
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


-- ─────────────────────────────────────────────────────────
-- 0014_realtime_publication.sql
-- ─────────────────────────────────────────────────────────
-- 0014_realtime_publication.sql
-- Expose the live-updating tables over Supabase Realtime. The publication is
-- created if it does not already exist, then tables are added (guarded so the
-- migration is idempotent). REPLICA IDENTITY FULL on filtered tables ensures
-- old-row data is carried in change events for client-side filtering.

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tool_visibility'
  ) then
    alter publication supabase_realtime add table public.tool_visibility;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'audit_logs'
  ) then
    alter publication supabase_realtime add table public.audit_logs;
  end if;
end
$$;

-- Carry full old-row data so filtered subscriptions receive complete payloads.
alter table public.tool_visibility replica identity full;
alter table public.notifications  replica identity full;


-- ─────────────────────────────────────────────────────────
-- seed.sql (departments, permissions, role_permissions, tools)
-- ─────────────────────────────────────────────────────────
-- seed.sql
-- Idempotent reference data for the AOI Team Hub. Re-running upserts rows.
-- Source of truth lives in:
--   * src/lib/constants/departments.ts  → departments
--   * src/lib/rbac/permissions.ts       → permissions, role_permissions
--   * src/lib/constants/tools.seed.ts   → tools
-- NOTE: the super admin auth user is NOT created here (it requires the auth
-- schema / service role) — that is scripts/seed-super-admin.ts.

-- ===========================================================================
-- Departments (8) — verbatim from departments.ts
-- ===========================================================================
insert into public.departments (id, code, name_en, name_ar, color, icon, blurb_en, blurb_ar, sort_order)
values
  ('sales',            'SLS', 'Sales',            'المبيعات',       '#FF8E5E', 'trending-up', 'Lead generation, pipeline tracking and outreach.', 'توليد العملاء، متابعة الصفقات، والتواصل.', 1),
  ('operations',       'OPS', 'Operations',       'العمليات',       '#43D9A0', 'package',     'Shipments, zones, pricing and daily dispatch.',     'الشحنات، المناطق، التسعير، والتشغيل اليومي.', 2),
  ('customer_service', 'CS',  'Customer Service', 'خدمة العملاء',   '#B49CFF', 'headset',     'Faster replies and cleaner ticket handling.',       'ردود أسرع وإدارة تذاكر أنظف.', 3),
  ('logistics',        'LOG', 'Logistics',        'اللوجستيات',     '#5EC8C8', 'truck',       'Fleet, routing and last-mile coordination.',        'الأسطول، المسارات، وتنسيق الميل الأخير.', 4),
  ('hr',               'HR',  'HR',               'الموارد البشرية', '#F78DA7', 'users',       'People, onboarding and team operations.',           'الموظفون، التعيين، وعمليات الفريق.', 5),
  ('finance',          'FIN', 'Finance',          'المالية',        '#4FC3F7', 'wallet',      'Carrier reconciliation, invoices and cost control.', 'تسويات الشحن، الفواتير، والتحكم في التكاليف.', 6),
  ('marketing',        'MKT', 'Marketing',        'التسويق',        '#FFC857', 'megaphone',   'Campaigns, content and brand growth.',              'الحملات، المحتوى، ونمو العلامة.', 7),
  ('it',               'IT',  'IT',               'تقنية المعلومات', '#7AA2F7', 'server',      'Systems, access and platform administration.',      'الأنظمة، الصلاحيات، وإدارة المنصة.', 8)
on conflict (id) do update set
  code       = excluded.code,
  name_en    = excluded.name_en,
  name_ar    = excluded.name_ar,
  color      = excluded.color,
  icon       = excluded.icon,
  blurb_en   = excluded.blurb_en,
  blurb_ar   = excluded.blurb_ar,
  sort_order = excluded.sort_order;

-- ===========================================================================
-- Permissions catalog — every value in PERMISSIONS (permissions.ts).
-- category = the prefix before the dot.
-- ===========================================================================
insert into public.permissions (key, description, category)
values
  ('dashboard.view',     'View own dashboard',                         'dashboard'),
  ('dashboard.view_all', 'View the organization-wide dashboard',       'dashboard'),
  ('tool.view',          'View available tools',                       'tool'),
  ('tool.launch',        'Launch tools',                               'tool'),
  ('user.view',          'View all users',                             'user'),
  ('user.view_dept',     'View users within own department',           'user'),
  ('user.manage',        'Create, update and disable users',           'user'),
  ('user.manage_role',   'Change user roles',                          'user'),
  ('visibility.manage',  'Manage per-tool visibility rules',           'visibility'),
  ('audit.view',         'View audit logs',                            'audit'),
  ('audit.view_dept',    'View audit logs for own department',         'audit'),
  ('audit.view_all',     'View all audit logs',                        'audit'),
  ('admin.panel',        'Access the admin panel',                     'admin')
on conflict (key) do update set
  description = excluded.description,
  category    = excluded.category;

-- ===========================================================================
-- Role → permission matrix — from ROLE_PERMISSIONS (permissions.ts).
-- super_admin receives every permission key.
-- ===========================================================================
insert into public.role_permissions (role, permission_key)
values
  -- employee
  ('employee', 'dashboard.view'),
  ('employee', 'tool.view'),
  ('employee', 'tool.launch'),
  -- manager
  ('manager', 'dashboard.view'),
  ('manager', 'tool.view'),
  ('manager', 'tool.launch'),
  ('manager', 'user.view_dept'),
  ('manager', 'audit.view_dept'),
  -- admin
  ('admin', 'dashboard.view'),
  ('admin', 'dashboard.view_all'),
  ('admin', 'tool.view'),
  ('admin', 'tool.launch'),
  ('admin', 'user.view'),
  ('admin', 'user.manage'),
  ('admin', 'visibility.manage'),
  ('admin', 'audit.view'),
  ('admin', 'audit.view_all'),
  ('admin', 'admin.panel')
on conflict (role, permission_key) do nothing;

-- super_admin gets ALL permission keys.
insert into public.role_permissions (role, permission_key)
select 'super_admin'::public.app_role, key from public.permissions
on conflict (role, permission_key) do nothing;

-- ===========================================================================
-- Tools — verbatim from tools.seed.ts
-- ===========================================================================
insert into public.tools (id, dept, name, version, status, featured, description, tags, launch_kind, launch_url, min_role)
values
  (
    'AOI-FIN-001', 'finance', 'Shipping Reconciler', 'v2.80', 'live', true,
    'Reconcile SMSA, EGY Post and Armex invoices against shipment sheets — pricing engines, PDF invoice parsing and editable zone maps in one screen.',
    array['SMSA', 'EGY POST', 'ARMEX', 'PDF PARSER', 'OLLAMA RAG'],
    'iframe', '/tools/reconciler/index.html', 'employee'
  ),
  (
    'AOI-SLS-001', 'sales', 'B2B Lead Generation Platform', 'v1.0', 'soon', false,
    'Discover and score freight leads from maps and directories, then generate WhatsApp outreach per governorate.',
    array['LEADS', 'SCORING', 'WHATSAPP'],
    'external', '#', 'employee'
  ),
  (
    'AOI-SLS-002', 'sales', 'Sales Leads Tracker', '', 'soon', false,
    'Pipeline with follow-up statuses, dates and conditional formatting for the sales team.',
    array['PIPELINE', 'FOLLOW-UP'],
    'external', '#', 'employee'
  ),
  (
    'AOI-OPS-001', 'operations', 'Shipment Status Dashboard', '', 'soon', false,
    'One screen for open shipments across all carriers, with exceptions surfaced first.',
    array['TRACKING', 'EXCEPTIONS'],
    'external', '#', 'employee'
  ),
  (
    'AOI-OPS-002', 'operations', 'Zones & Pricing Manager', '', 'soon', false,
    'Edit carrier zones and rate cards in one place and export clean reference sheets.',
    array['ZONES', 'RATE CARDS'],
    'external', '#', 'manager'
  ),
  (
    'AOI-CS-001', 'customer_service', 'Smart Reply Assistant', '', 'soon', false,
    'Suggested answers for common shipment questions, ready to paste into chat.',
    array['REPLIES', 'TEMPLATES'],
    'external', '#', 'employee'
  ),
  (
    'AOI-CS-002', 'customer_service', 'Ticket Triage Board', '', 'soon', false,
    'Sort incoming issues by urgency and route them to the right owner.',
    array['TICKETS', 'ROUTING'],
    'external', '#', 'employee'
  )
on conflict (id) do update set
  dept        = excluded.dept,
  name        = excluded.name,
  version     = excluded.version,
  status      = excluded.status,
  featured    = excluded.featured,
  description = excluded.description,
  tags        = excluded.tags,
  launch_kind = excluded.launch_kind,
  launch_url  = excluded.launch_url,
  min_role    = excluded.min_role;
