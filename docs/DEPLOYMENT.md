# Deployment Guide — AOI Team Hub (Phase 1)

This guide takes you from an empty Supabase project to a live, shareable URL on
Vercel. Estimated time: ~20 minutes.

---

## 1. Create the Supabase project

1. Create a project at <https://supabase.com/dashboard>. Pick a region close to your
   team (e.g. Frankfurt for Egypt) and save the database password.
2. In **Project Settings → API**, note:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

### Apply the schema

Run the migrations **in order** (`0001` → `0014`) then `seed.sql`. Two options:

**A. Supabase CLI (recommended)**
```bash
npm i -g supabase
supabase link --project-ref <your-project-ref>
supabase db push                 # applies everything in supabase/migrations
# then run the seed:
supabase db execute --file supabase/seed.sql
```

**B. SQL editor / MCP** — paste each file from `supabase/migrations/` in numeric
order into the dashboard SQL editor and run, then run `supabase/seed.sql`. (If you use
the Supabase MCP tools, `apply_migration` per file in order achieves the same.)

### Configure Auth

In **Authentication → Providers → Email**:
- Enable Email provider.
- For an immediately usable team portal, you may **disable "Confirm email"** so new
  registrations are active at once. If you keep it on, the `/auth/callback` route
  handles confirmation links.
- (Optional) Enable **MFA / TOTP** under Authentication settings — the schema and
  profile flag are already in place.

### Enable Realtime

Migration `0014` adds `profiles`, `tool_visibility`, `notifications`, and `audit_logs`
to the `supabase_realtime` publication. Confirm under **Database → Replication** that
these tables are enabled.

---

## 2. Seed the super admin

From a machine with the repo checked out and `.env.local` filled in:

```bash
npm install
npm run seed:admin
```

This reads `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD` /
`SEED_SUPERADMIN_USERNAME` / `SEED_SUPERADMIN_NAME`, creates the auth user, and
elevates its profile to `super_admin` (dept `it`, `must_change_password = true`).

---

## 3. Deploy the frontend to Vercel

1. Import the GitHub repo at <https://vercel.com/new>. Framework preset: **Next.js**.
2. Add Environment Variables (Production + Preview):

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | your project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service role key (secret) |
   | `NEXT_PUBLIC_SITE_URL` | your Vercel URL (e.g. `https://aoi-hub.vercel.app`) |
   | `LEGACY_BRIDGE_SECRET` | a long random string |
   | `UPSTASH_REDIS_REST_URL` / `_TOKEN` | optional (distributed rate limiting) |

3. Deploy. Then in Supabase **Authentication → URL Configuration**, set the Site URL
   and add `https://<your-domain>/auth/callback` to the redirect allow-list.

Your shareable URL is the Vercel domain. Add a custom domain in Vercel if desired.

---

## 4. End-to-end verification

1. Visit the URL → you are redirected to `/login` (middleware).
2. Log in as the **super admin** → forced to set a new password → the **dashboard**
   shows real counts (users, active sessions, role distribution, recent activity
   including your login).
3. **Register** a new employee with a department → a `profiles` row is created with
   role `employee`.
4. As that employee, confirm the sidebar/tools show only department-visible tools and
   that `/admin/*` is blocked.
5. As an admin, open **Admin → Tool Visibility**, hide the reconciler from the
   employee's department → the employee's open tab updates **without a refresh**
   (Realtime), and `Admin → Audit Logs` shows a `visibility_change` entry.
6. As a Finance user, open the **Shipping Reconciler** → it loads in-app with no lock
   overlay (session bridged); a `tool_access` entry is logged.
7. Log out → the reconciler re-locks; a `logout` entry is logged.
8. (RLS proof) As an employee, query other users' profiles via the browser Supabase
   client → only your own row returns.
9. Install the PWA and go offline → cached dashboard and reconciler remain usable.

---

## Notes

- The build does not require Supabase env vars (clients are constructed lazily at
  request time), so CI builds succeed without secrets.
- Rate limiting falls back to an in-memory limiter when Upstash is not configured —
  fine for a single instance; configure Upstash for multi-region scale.
