-- ============================================================
-- 0015_tasks.sql — My Tasks module (Phase 2)
-- Tasks, comments, RLS, automation (notify when an assignee
-- completes ALL their tasks), and realtime. Idempotent.
-- ============================================================

-- ── enums ───────────────────────────────────────────────────
do $$ begin
  create type task_status as enum ('todo','in_progress','done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_priority as enum ('low','medium','high','urgent');
exception when duplicate_object then null; end $$;

-- ── tables ──────────────────────────────────────────────────
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  progress int not null default 0 check (progress between 0 and 100),
  due_date timestamptz,
  assignee_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  dept dept_id,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists tasks_assignee_idx on public.tasks(assignee_id);
create index if not exists tasks_dept_idx on public.tasks(dept);
create index if not exists tasks_status_idx on public.tasks(status);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_username text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists task_comments_task_idx on public.task_comments(task_id, created_at);

-- ── helper: can the current user see a task row ──────────────
create or replace function public.can_see_task(t public.tasks)
returns boolean language sql stable security definer set search_path = public as $$
  select t.assignee_id = auth.uid()
      or t.created_by = auth.uid()
      or public.is_admin()
      or (public.current_app_role() = 'manager' and t.dept = public.current_dept());
$$;

-- ── RLS ─────────────────────────────────────────────────────
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;

drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks for select using ( public.can_see_task(tasks) );

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks for insert with check (
  created_by = auth.uid()
  and (public.is_admin() or public.current_app_role() = 'manager')
);

drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks for update using (
  assignee_id = auth.uid()
  or created_by = auth.uid()
  or public.is_admin()
  or (public.current_app_role() = 'manager' and dept = public.current_dept())
);

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks for delete using (
  public.is_admin() or created_by = auth.uid()
);

drop policy if exists task_comments_select on public.task_comments;
create policy task_comments_select on public.task_comments for select using (
  exists (select 1 from public.tasks t where t.id = task_id and public.can_see_task(t))
);

drop policy if exists task_comments_insert on public.task_comments;
create policy task_comments_insert on public.task_comments for insert with check (
  author_id = auth.uid()
  and exists (select 1 from public.tasks t where t.id = task_id and public.can_see_task(t))
);

-- ── triggers: updated_at + completed_at ─────────────────────
create or replace function public.tasks_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'done' and (old.status is distinct from 'done') then
    new.completed_at := now();
    if new.progress < 100 then new.progress := 100; end if;
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end; $$;

drop trigger if exists trg_tasks_touch on public.tasks;
create trigger trg_tasks_touch before update on public.tasks
  for each row execute function public.tasks_touch();

-- ── automation: notify admins+managers when an assignee
--     completes ALL of their tasks (spec §9) ─────────────────
create or replace function public.tasks_all_done_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare remaining int; who text;
begin
  if new.status = 'done' and (old.status is distinct from 'done') then
    select count(*) into remaining from public.tasks
      where assignee_id = new.assignee_id and status <> 'done';
    if remaining = 0 then
      select full_name into who from public.profiles where id = new.assignee_id;
      insert into public.notifications (user_id, type, title_en, title_ar, body_en, body_ar, data)
      select p.id, 'success',
        coalesce(who,'A teammate') || ' completed all assigned tasks',
        coalesce(who,'أحد الزملاء') || ' خلّص كل المهام المسندة له',
        '', '',
        jsonb_build_object('event','all_tasks_done','assignee', new.assignee_id)
      from public.profiles p
      where p.role in ('super_admin','admin','manager') and p.status = 'active';
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_tasks_all_done on public.tasks;
create trigger trg_tasks_all_done after update on public.tasks
  for each row execute function public.tasks_all_done_notify();

-- ── realtime ────────────────────────────────────────────────
do $$ begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.task_comments;
exception when duplicate_object then null; end $$;
alter table public.tasks replica identity full;
