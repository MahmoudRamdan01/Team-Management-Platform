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
