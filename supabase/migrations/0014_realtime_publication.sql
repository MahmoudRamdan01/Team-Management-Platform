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
