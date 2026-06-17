/**
 * Lightweight rate limiter. Uses Upstash Redis when configured (multi-instance
 * safe), otherwise falls back to an in-memory window (best-effort, single
 * instance — acceptable for low-traffic admin/auth endpoints).
 *
 * The interface is deliberately tiny so it can be swapped for Redis/Socket.IO
 * infra later without touching call sites.
 */
const memory = new Map<string, { count: number; reset: number }>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

export async function rateLimit(key: string, limit = 10, windowMs = 60_000): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      // INCR + PEXPIRE via Upstash REST pipeline
      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["INCR", `rl:${key}`],
          ["PEXPIRE", `rl:${key}`, String(windowMs), "NX"],
        ]),
        cache: "no-store",
      });
      const data = (await res.json()) as { result: unknown }[];
      const count = Number((data?.[0] as any)?.result ?? 0);
      return { success: count <= limit, remaining: Math.max(0, limit - count) };
    } catch {
      // fall through to memory limiter on transient errors
    }
  }

  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.reset < now) {
    memory.set(key, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  entry.count++;
  return { success: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}
