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
