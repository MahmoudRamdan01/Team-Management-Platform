# AOI Team Hub — Enterprise Team Management Platform

A scalable, secure, production-ready team platform for **Air Ocean Line**, rebuilt
from the original single-file HTML hub into a modular Next.js + Supabase application.

This repository contains **Phase 1: the deployable foundation** — authentication,
departments, four-role RBAC, a dynamic tool-visibility engine, real-time updates,
audit logging, an executive dashboard, and the existing finance tools integrated and
access-controlled. Later phases build the notifications center, tasks, chat, file
manager, reports, and backup on top of this base.

---

## Stack

| Layer        | Choice                                                            |
| ------------ | ---------------------------------------------------------------- |
| Frontend     | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS    |
| PWA          | `@ducanh2912/next-pwa` (offline reads, installable)              |
| Backend      | Supabase — Postgres, Auth (JWT + MFA/TOTP), Realtime, Storage    |
| Authz        | Postgres Row-Level Security + Next.js middleware + UI guards      |
| Realtime     | Supabase Realtime (postgres_changes + presence)                  |
| Validation   | Zod                                                              |
| Data fetching| TanStack Query                                                  |

> **Migration path.** All business logic goes through an abstracted
> repository/service layer (`src/lib/repositories`, `src/lib/services`). Supabase is
> only touched inside `src/lib/supabase/*` and `src/lib/repositories/supabase/*`.
> Swapping to FastAPI/NestJS + Redis + Socket.IO + S3 later means writing a parallel
> `repositories/rest/*` and flipping one line in `getRepositories()`.

---

## Phase 1 features

- **Authentication** — email/password login, registration with department selection,
  secure cookie sessions (`@supabase/ssr`), forced-password-change flag, MFA-ready
  (`profiles.mfa_enabled` + Supabase TOTP factors).
- **8 departments** — Sales, Operations, Customer Service, Logistics, HR, Finance,
  Marketing, IT. Stored on the profile and used for access control.
- **4-role RBAC** — `super_admin > admin > manager > employee`, enforced at **four
  layers**: middleware route gates → server components/route handlers → Postgres RLS
  → UI guards. Frontend checks are cosmetic; the database is the backstop.
- **Dynamic tool-visibility engine** — admins show/hide any tool per **user, role, or
  department** at runtime with no code changes. Precedence: user > role > department >
  the tool's default `min_role`.
- **Real-time** — permission, visibility, and notification changes propagate to open
  clients without a manual refresh; live presence powers the "online now" indicator.
- **Audit logging** — append-only, queryable log of logins, tool access, permission/
  visibility changes, and user-management actions, with actor, target, IP and time.
- **Executive dashboard** — real counts: total/active users, active sessions, live
  tools, role + department distribution, and a recent-activity feed.
- **Existing tools integrated** — the Shipping Reconciler runs in-app, gated by RBAC +
  visibility, with the new auth session bridged into the legacy `AOI_SESSION_SHARED`
  contract it already understands.

---

## Project structure

```
middleware.ts                 # layer-1 route auth + coarse RBAC
next.config.mjs               # security headers (CSP/HSTS/…) + PWA
src/
  app/
    (auth)/{login,register}/   # branded auth portal
    (app)/{dashboard,tools,departments,admin}/   # the SaaS shell
    api/{auth,admin,tools,presence}/             # server route handlers
  components/{auth,layout,dashboard,tools,admin,brand,ui,guards}/
  lib/
    supabase/{client,server,middleware,admin}.ts   # the ONLY SDK touchpoints
    repositories/   # interfaces (contract) + supabase/ (impl) + index.ts (swap seam)
    services/       # backend-agnostic business logic
    rbac/           # roles, permission catalog/matrix, route map, access context
    realtime/ · i18n/ · validation/ · constants/
  hooks/
supabase/
  migrations/0001..0014.sql · seed.sql            # schema, RLS, triggers, seed
scripts/seed-super-admin.ts                       # provisions the first super admin
public/tools/reconciler/index.html               # wrapped legacy finance tool
docs/{DEPLOYMENT,ARCHITECTURE}.md
```

---

## Local development

```bash
npm install
cp .env.example .env.local           # fill in Supabase + secrets
# apply supabase/migrations + seed.sql to your project (see docs/DEPLOYMENT.md)
npm run seed:admin                    # create the super admin
npm run dev                           # http://localhost:3000
```

Useful scripts: `npm run build`, `npm run typecheck`, `npm run lint`,
`npm run gen:types` (regenerate `src/types/database.types.ts` from the DB).

Full setup, environment variables, and an end-to-end verification click-path are in
**[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**. Architecture and security details are in
**[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

---

## Security highlights

JWT + rotating refresh tokens in httpOnly/Secure/SameSite cookies · RLS on every table
with `SECURITY DEFINER` helpers (pinned `search_path`) · append-only audit log ·
service-role key confined to the server · CSP/HSTS/X-Frame-Options/nosniff headers ·
Zod validation on every input · rate-limited auth and admin endpoints · same-origin +
SameSite CSRF posture. See `docs/ARCHITECTURE.md` for the full model.

---

## Default credentials

The super admin is provisioned by `scripts/seed-super-admin.ts` from
`SEED_SUPERADMIN_*` env vars and is forced to change its password on first login.
There are **no** hard-coded credentials in the codebase.
