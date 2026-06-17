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
