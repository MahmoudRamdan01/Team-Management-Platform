import { createHmac } from "node:crypto";
import type { Profile } from "@/lib/repositories/types";
import { isAdminRole } from "@/lib/rbac/roles";
import { legacyDeptCode } from "@/lib/constants/departments";

/**
 * Builds the exact `AOI_SESSION_SHARED` payload that the legacy reconciler (and
 * any other wrapped HTML tool) reads from localStorage:
 *   { uid, name, username, dept, role, token, exp }
 *
 * The `token` is a short-lived HMAC bridge token — NOT the Supabase JWT, which
 * is never exposed to the sandboxed tool. The tool only uses it to satisfy its
 * gate and to attribute its own audit entries (window.AOI_USER.name).
 */
export interface LegacySession {
  uid: string;
  name: string;
  username: string;
  dept: string;
  role: "admin" | "member";
  token: string;
  exp: number;
}

const SECRET = process.env.LEGACY_BRIDGE_SECRET || "aoi-dev-bridge-secret";

function b64url(s: string): string {
  return Buffer.from(s).toString("base64url");
}

export function signBridgeToken(uid: string, exp: number): string {
  const payload = `${uid}.${exp}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${b64url(payload)}.${sig}`;
}

export function verifyBridgeToken(token: string): { uid: string; exp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  try {
    const payload = Buffer.from(parts[0], "base64url").toString("utf8");
    const [uid, expStr] = payload.split(".");
    const exp = Number(expStr);
    const expected = createHmac("sha256", SECRET).update(`${uid}.${exp}`).digest("base64url");
    if (expected !== parts[1]) return null;
    if (!exp || exp < Date.now()) return null;
    return { uid, exp };
  } catch {
    return null;
  }
}

export function buildLegacySession(profile: Profile, expiresAtMs: number): LegacySession {
  return {
    uid: profile.id,
    name: profile.fullName,
    username: profile.username,
    dept: legacyDeptCode(profile.dept),
    role: isAdminRole(profile.role) ? "admin" : "member",
    token: signBridgeToken(profile.id, expiresAtMs),
    exp: expiresAtMs,
  };
}
