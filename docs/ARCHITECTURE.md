# Architecture — AOI Team Hub

## Goals

Production-ready today on Supabase, with a clean path to a self-hosted stack
(FastAPI/NestJS + Postgres + Redis + Socket.IO + S3) later. Security, RBAC,
department scoping, real-time, and audit are first-class.

## Layered design

```
React UI (server + client components)
        │  domain models only
Services (src/lib/services)        ← business logic, backend-agnostic
        │  repository interfaces
Repositories (src/lib/repositories)
   ├─ interfaces + types.ts        ← the contract
   └─ supabase/*                   ← the only implementation today
        │
Supabase SDK (src/lib/supabase/*)  ← the only SDK touchpoints
        │
Postgres + RLS  ·  Auth  ·  Realtime  ·  Storage
```

**Swap seam.** `src/lib/repositories/index.ts` exposes `getRepositories(client)`.
Services depend on the `Repositories` interface, never on Supabase. To migrate the
backend, add `repositories/rest/*` implementing the same interfaces and change the one
line in `getRepositories`. RLS rules then move into the new API's authorization
middleware — the intent is already documented in `services/access.service.ts`.

## RBAC — defense in depth

A request must pass every layer that applies:

1. **Middleware** (`middleware.ts`) — refreshes the session cookie, redirects
   unauthenticated users, and gates `/admin/*` to admin roles. Coarse.
2. **Server components / route handlers** — re-resolve the user with
   `getServerContext()` / `requirePermission()` and call `AccessService` for fine
   checks. All mutations live here; admin mutations use the service-role client
   **after** re-checking the caller's permission.
3. **Postgres RLS** — the final backstop. Even a bug in layers 1–2 cannot leak or
   mutate rows outside the caller's scope.
4. **UI guards** — `<Can>` / `<RoleGate>` and `useAccess()` hide nav and controls.
   Cosmetic only.

### Roles & permissions

`super_admin > admin > manager > employee` (`src/lib/rbac/roles.ts`). Permissions are
a data-driven catalog (`permissions` table + `role_permissions` matrix) mirrored in
`src/lib/rbac/permissions.ts`. Effective permissions = role grants ∪ per-user grants −
per-user denies. Role escalation is blocked by a DB trigger unless performed by a
super admin (or the service role during seeding).

## Dynamic tool-visibility engine

`tool_visibility` rows carry a `scope` (`user` | `role` | `department`), a subject,
and a `visible` flag. The `can_user_see_tool(uid, tool)` SQL function resolves with
precedence **user > role > department**, falling back to the tool's `min_role`. The
`tools` RLS `SELECT` policy calls it, so hidden tools are invisible at the row level —
the UI never has to filter them. Admins edit rules at runtime in
`Admin → Tool Visibility`; changes broadcast over Realtime and every client
re-renders without a refresh.

## Real-time

Migration `0014` publishes `profiles`, `tool_visibility`, `notifications`, and
`audit_logs`. The client (`useRealtimeSync`) subscribes to a per-user channel and an
org-wide visibility channel and calls `router.refresh()` on relevant changes.
Presence (`usePresence`) tracks who is online and drives the "online now" indicator;
a periodic heartbeat to `/api/presence` keeps the durable `active_sessions` count
(used by the dashboard) fresh.

## Legacy tool bridge

The 7,595-line reconciler is served verbatim from `public/tools/reconciler/index.html`
(one line patched: its lock-overlay link now points to `/login`). It self-gates on
`localStorage["AOI_SESSION_SHARED"]`. On launch, `/api/tools/[toolId]/launch` verifies
access, writes a `tool_access` audit row, and mints a short-lived **HMAC bridge token**
(not the Supabase JWT) in the exact `{uid,name,username,dept,role,token,exp}` shape the
tool expects — mapping `customer_service→cs` and `super_admin/admin→admin`. The
same-origin iframe reads it; logout clears it so the tool re-locks.

## Database

See `supabase/migrations/`. Tables: `departments`, `profiles` (1:1 with `auth.users`),
`permissions` / `role_permissions` / `user_permissions`, `tools`, `tool_visibility`,
`audit_logs` (append-only), `notifications`, `active_sessions`. Helpers in `0011` are
`SECURITY DEFINER` with a pinned `search_path` to break RLS recursion safely.

## Security model

- **Sessions:** short JWT + rotating refresh in httpOnly/Secure/SameSite cookies.
- **MFA:** TOTP-ready (`profiles.mfa_enabled`, Supabase factors).
- **Transport/headers:** HSTS, CSP (self + Supabase only; fonts and reconciler libs
  self-hosted), X-Frame-Options SAMEORIGIN, nosniff, Referrer-Policy,
  Permissions-Policy — all in `next.config.mjs`.
- **Input:** Zod schemas on every form, route handler, and the seed script.
- **Abuse:** rate limiting on login / register / admin-create-user (Upstash or
  in-memory); failed logins recorded as `login_failed` audit rows.
- **Audit:** append-only; UPDATE/DELETE revoked from `authenticated`.

## PWA / offline

`@ducanh2912/next-pwa` precaches the app shell, fonts, and the reconciler bundle;
navigations/API use NetworkFirst, static assets CacheFirst. The app renders cached
data offline with an "offline — cached" banner; privileged mutations are online-only.

## Deferred to later phases

Full notifications center, tasks/boards, chat, file manager, reports/analytics beyond
the dashboard metrics, backup/recovery tooling, refactoring the reconciler into React,
and full offline write-sync for privileged mutations.
