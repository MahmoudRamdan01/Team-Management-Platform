/**
 * seed-super-admin.ts
 *
 * Standalone script that provisions the initial super admin account.
 * Run with:  npx tsx scripts/seed-super-admin.ts   (or: npm run seed:admin)
 *
 * It needs the service role key because it creates an auth.users record and
 * elevates the corresponding public.profiles row to super_admin. The
 * handle_new_user() trigger (migration 0013) creates the profile automatically
 * when the auth user is inserted; this script then patches that profile.
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SEED_SUPERADMIN_EMAIL
 *   SEED_SUPERADMIN_PASSWORD
 * Optional env:
 *   SEED_SUPERADMIN_USERNAME  (default: local-part of the email)
 *   SEED_SUPERADMIN_NAME      (default: "AOI Super Admin")
 */

import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    console.error(`[seed-super-admin] Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main(): Promise<void> {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const email = requireEnv("SEED_SUPERADMIN_EMAIL");
  const password = requireEnv("SEED_SUPERADMIN_PASSWORD");

  const username =
    process.env.SEED_SUPERADMIN_USERNAME?.trim() || email.split("@")[0];
  const fullName = process.env.SEED_SUPERADMIN_NAME?.trim() || "AOI Super Admin";

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`[seed-super-admin] Ensuring super admin user: ${email}`);

  // 1) Create the auth user (or look it up if it already exists).
  let userId: string | null = null;

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, username, dept: "it" },
    });

  if (createError) {
    const message = createError.message?.toLowerCase() ?? "";
    const alreadyExists =
      message.includes("already") ||
      message.includes("registered") ||
      (createError as { status?: number }).status === 422;

    if (!alreadyExists) {
      console.error(
        `[seed-super-admin] Failed to create auth user: ${createError.message}`
      );
      process.exit(1);
    }

    console.log(
      "[seed-super-admin] Auth user already exists — looking it up by email."
    );
    userId = await findUserIdByEmail(supabase as unknown as Parameters<typeof findUserIdByEmail>[0], email);
    if (!userId) {
      console.error(
        "[seed-super-admin] Could not locate the existing user by email."
      );
      process.exit(1);
    }
  } else {
    userId = created.user?.id ?? null;
    if (!userId) {
      console.error("[seed-super-admin] createUser returned no user id.");
      process.exit(1);
    }
    console.log(`[seed-super-admin] Created auth user (id=${userId}).`);
  }

  // 2) Elevate the profile row to super_admin.
  // The handle_new_user trigger should have created it; upsert to be safe.
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: fullName,
        username,
        dept: "it",
        role: "super_admin",
        status: "active",
        must_change_password: true,
      },
      { onConflict: "id" }
    );

  if (upsertError) {
    console.error(
      `[seed-super-admin] Failed to update profile: ${upsertError.message}`
    );
    process.exit(1);
  }

  console.log(
    `[seed-super-admin] Success — ${email} is now a super_admin (id=${userId}).`
  );
  process.exit(0);
}

/**
 * Paginate through admin.listUsers to find a user id by email.
 */
async function findUserIdByEmail(
  supabase: ReturnType<typeof createClient>,
  email: string
): Promise<string | null> {
  const target = email.toLowerCase();
  const perPage = 1000;

  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      console.error(
        `[seed-super-admin] listUsers failed: ${error.message}`
      );
      return null;
    }

    const match = data.users.find(
      (u) => (u.email ?? "").toLowerCase() === target
    );
    if (match) return match.id;

    if (data.users.length < perPage) break; // last page
  }

  return null;
}

main().catch((err) => {
  console.error("[seed-super-admin] Unexpected error:", err);
  process.exit(1);
});
