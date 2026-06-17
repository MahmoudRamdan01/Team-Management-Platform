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
