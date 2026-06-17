-- seed.sql
-- Idempotent reference data for the AOI Team Hub. Re-running upserts rows.
-- Source of truth lives in:
--   * src/lib/constants/departments.ts  → departments
--   * src/lib/rbac/permissions.ts       → permissions, role_permissions
--   * src/lib/constants/tools.seed.ts   → tools
-- NOTE: the super admin auth user is NOT created here (it requires the auth
-- schema / service role) — that is scripts/seed-super-admin.ts.

-- ===========================================================================
-- Departments (8) — verbatim from departments.ts
-- ===========================================================================
insert into public.departments (id, code, name_en, name_ar, color, icon, blurb_en, blurb_ar, sort_order)
values
  ('sales',            'SLS', 'Sales',            'المبيعات',       '#FF8E5E', 'trending-up', 'Lead generation, pipeline tracking and outreach.', 'توليد العملاء، متابعة الصفقات، والتواصل.', 1),
  ('operations',       'OPS', 'Operations',       'العمليات',       '#43D9A0', 'package',     'Shipments, zones, pricing and daily dispatch.',     'الشحنات، المناطق، التسعير، والتشغيل اليومي.', 2),
  ('customer_service', 'CS',  'Customer Service', 'خدمة العملاء',   '#B49CFF', 'headset',     'Faster replies and cleaner ticket handling.',       'ردود أسرع وإدارة تذاكر أنظف.', 3),
  ('logistics',        'LOG', 'Logistics',        'اللوجستيات',     '#5EC8C8', 'truck',       'Fleet, routing and last-mile coordination.',        'الأسطول، المسارات، وتنسيق الميل الأخير.', 4),
  ('hr',               'HR',  'HR',               'الموارد البشرية', '#F78DA7', 'users',       'People, onboarding and team operations.',           'الموظفون، التعيين، وعمليات الفريق.', 5),
  ('finance',          'FIN', 'Finance',          'المالية',        '#4FC3F7', 'wallet',      'Carrier reconciliation, invoices and cost control.', 'تسويات الشحن، الفواتير، والتحكم في التكاليف.', 6),
  ('marketing',        'MKT', 'Marketing',        'التسويق',        '#FFC857', 'megaphone',   'Campaigns, content and brand growth.',              'الحملات، المحتوى، ونمو العلامة.', 7),
  ('it',               'IT',  'IT',               'تقنية المعلومات', '#7AA2F7', 'server',      'Systems, access and platform administration.',      'الأنظمة، الصلاحيات، وإدارة المنصة.', 8)
on conflict (id) do update set
  code       = excluded.code,
  name_en    = excluded.name_en,
  name_ar    = excluded.name_ar,
  color      = excluded.color,
  icon       = excluded.icon,
  blurb_en   = excluded.blurb_en,
  blurb_ar   = excluded.blurb_ar,
  sort_order = excluded.sort_order;

-- ===========================================================================
-- Permissions catalog — every value in PERMISSIONS (permissions.ts).
-- category = the prefix before the dot.
-- ===========================================================================
insert into public.permissions (key, description, category)
values
  ('dashboard.view',     'View own dashboard',                         'dashboard'),
  ('dashboard.view_all', 'View the organization-wide dashboard',       'dashboard'),
  ('tool.view',          'View available tools',                       'tool'),
  ('tool.launch',        'Launch tools',                               'tool'),
  ('user.view',          'View all users',                             'user'),
  ('user.view_dept',     'View users within own department',           'user'),
  ('user.manage',        'Create, update and disable users',           'user'),
  ('user.manage_role',   'Change user roles',                          'user'),
  ('visibility.manage',  'Manage per-tool visibility rules',           'visibility'),
  ('audit.view',         'View audit logs',                            'audit'),
  ('audit.view_dept',    'View audit logs for own department',         'audit'),
  ('audit.view_all',     'View all audit logs',                        'audit'),
  ('admin.panel',        'Access the admin panel',                     'admin')
on conflict (key) do update set
  description = excluded.description,
  category    = excluded.category;

-- ===========================================================================
-- Role → permission matrix — from ROLE_PERMISSIONS (permissions.ts).
-- super_admin receives every permission key.
-- ===========================================================================
insert into public.role_permissions (role, permission_key)
values
  -- employee
  ('employee', 'dashboard.view'),
  ('employee', 'tool.view'),
  ('employee', 'tool.launch'),
  -- manager
  ('manager', 'dashboard.view'),
  ('manager', 'tool.view'),
  ('manager', 'tool.launch'),
  ('manager', 'user.view_dept'),
  ('manager', 'audit.view_dept'),
  -- admin
  ('admin', 'dashboard.view'),
  ('admin', 'dashboard.view_all'),
  ('admin', 'tool.view'),
  ('admin', 'tool.launch'),
  ('admin', 'user.view'),
  ('admin', 'user.manage'),
  ('admin', 'visibility.manage'),
  ('admin', 'audit.view'),
  ('admin', 'audit.view_all'),
  ('admin', 'admin.panel')
on conflict (role, permission_key) do nothing;

-- super_admin gets ALL permission keys.
insert into public.role_permissions (role, permission_key)
select 'super_admin'::public.app_role, key from public.permissions
on conflict (role, permission_key) do nothing;

-- ===========================================================================
-- Tools — verbatim from tools.seed.ts
-- ===========================================================================
insert into public.tools (id, dept, name, version, status, featured, description, tags, launch_kind, launch_url, min_role)
values
  (
    'AOI-FIN-001', 'finance', 'Shipping Reconciler', 'v2.80', 'live', true,
    'Reconcile SMSA, EGY Post and Armex invoices against shipment sheets — pricing engines, PDF invoice parsing and editable zone maps in one screen.',
    array['SMSA', 'EGY POST', 'ARMEX', 'PDF PARSER', 'OLLAMA RAG'],
    'iframe', '/tools/reconciler/index.html', 'employee'
  ),
  (
    'AOI-SLS-001', 'sales', 'B2B Lead Generation Platform', 'v1.0', 'soon', false,
    'Discover and score freight leads from maps and directories, then generate WhatsApp outreach per governorate.',
    array['LEADS', 'SCORING', 'WHATSAPP'],
    'external', '#', 'employee'
  ),
  (
    'AOI-SLS-002', 'sales', 'Sales Leads Tracker', '', 'soon', false,
    'Pipeline with follow-up statuses, dates and conditional formatting for the sales team.',
    array['PIPELINE', 'FOLLOW-UP'],
    'external', '#', 'employee'
  ),
  (
    'AOI-OPS-001', 'operations', 'Shipment Status Dashboard', '', 'soon', false,
    'One screen for open shipments across all carriers, with exceptions surfaced first.',
    array['TRACKING', 'EXCEPTIONS'],
    'external', '#', 'employee'
  ),
  (
    'AOI-OPS-002', 'operations', 'Zones & Pricing Manager', '', 'soon', false,
    'Edit carrier zones and rate cards in one place and export clean reference sheets.',
    array['ZONES', 'RATE CARDS'],
    'external', '#', 'manager'
  ),
  (
    'AOI-CS-001', 'customer_service', 'Smart Reply Assistant', '', 'soon', false,
    'Suggested answers for common shipment questions, ready to paste into chat.',
    array['REPLIES', 'TEMPLATES'],
    'external', '#', 'employee'
  ),
  (
    'AOI-CS-002', 'customer_service', 'Ticket Triage Board', '', 'soon', false,
    'Sort incoming issues by urgency and route them to the right owner.',
    array['TICKETS', 'ROUTING'],
    'external', '#', 'employee'
  )
on conflict (id) do update set
  dept        = excluded.dept,
  name        = excluded.name,
  version     = excluded.version,
  status      = excluded.status,
  featured    = excluded.featured,
  description = excluded.description,
  tags        = excluded.tags,
  launch_kind = excluded.launch_kind,
  launch_url  = excluded.launch_url,
  min_role    = excluded.min_role;
