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
