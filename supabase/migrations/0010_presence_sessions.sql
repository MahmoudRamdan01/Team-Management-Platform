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
