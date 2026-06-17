-- 0011_helper_functions.sql
-- SECURITY DEFINER helpers used by RLS policies. They run with the function
-- owner's privileges and a pinned search_path, so policies can read `profiles`
-- WITHOUT re-triggering the profiles RLS policy (which would otherwise recurse).

-- The role of the currently authenticated user.
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- The department of the currently authenticated user.
create or replace function public.current_dept()
returns public.dept_id
language sql
stable
security definer
set search_path = public
as $$
  select dept from public.profiles where id = auth.uid();
$$;

-- True if the current user is an admin or super admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() in ('super_admin', 'admin'), false);
$$;

-- Numeric privilege rank for a role (higher = more privileged).
create or replace function public.role_rank(r public.app_role)
returns int
language sql
immutable
as $$
  select case r
    when 'employee'    then 1
    when 'manager'     then 2
    when 'admin'       then 3
    when 'super_admin' then 4
    else 0
  end;
$$;

-- Resolve whether a given user may see a given tool.
-- Precedence: user-scoped rule > role-scoped rule > department-scoped rule.
-- If no override matches, fall back to min_role comparison.
create or replace function public.can_user_see_tool(uid uuid, tool text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role    public.app_role;
  v_dept    public.dept_id;
  v_min     public.app_role;
  v_visible boolean;
begin
  select role, dept into v_role, v_dept from public.profiles where id = uid;

  -- Unknown user → not visible.
  if v_role is null then
    return false;
  end if;

  -- 1) User-scoped override (highest precedence).
  select tv.visible into v_visible
  from public.tool_visibility tv
  where tv.tool_id = tool and tv.scope = 'user' and tv.subject_user = uid
  limit 1;
  if found then
    return v_visible;
  end if;

  -- 2) Role-scoped override.
  select tv.visible into v_visible
  from public.tool_visibility tv
  where tv.tool_id = tool and tv.scope = 'role' and tv.subject_role = v_role
  limit 1;
  if found then
    return v_visible;
  end if;

  -- 3) Department-scoped override.
  if v_dept is not null then
    select tv.visible into v_visible
    from public.tool_visibility tv
    where tv.tool_id = tool and tv.scope = 'department' and tv.subject_dept = v_dept
    limit 1;
    if found then
      return v_visible;
    end if;
  end if;

  -- 4) Fallback: user's role must out-rank (or equal) the tool's min_role.
  select min_role into v_min from public.tools where id = tool;
  if v_min is null then
    return false;
  end if;

  return public.role_rank(v_role) >= public.role_rank(v_min);
end;
$$;
