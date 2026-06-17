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
