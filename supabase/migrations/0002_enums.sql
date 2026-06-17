-- 0002_enums.sql
-- Domain enums mirroring src/lib/repositories/types.ts (Role, DeptId, AuditAction).
-- Each type is created only when it does not already exist so re-running is safe.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('super_admin', 'admin', 'manager', 'employee');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'dept_id') then
    create type public.dept_id as enum (
      'sales',
      'operations',
      'customer_service',
      'logistics',
      'hr',
      'finance',
      'marketing',
      'it'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'audit_action') then
    create type public.audit_action as enum (
      'login',
      'logout',
      'login_failed',
      'register',
      'permission_change',
      'visibility_change',
      'tool_access',
      'user_create',
      'user_update',
      'user_disable',
      'role_change',
      'admin_action'
    );
  end if;
end
$$;
