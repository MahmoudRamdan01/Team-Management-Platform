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
