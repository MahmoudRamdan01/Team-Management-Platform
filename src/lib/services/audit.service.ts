import type { Repositories } from "@/lib/repositories";
import type { AuditFilter, NewAuditEntry } from "@/lib/repositories/types";

export class AuditService {
  constructor(private repos: Repositories) {}

  log(entry: NewAuditEntry): Promise<void> {
    return this.repos.audit.log(entry);
  }

  query(filter: AuditFilter) {
    return this.repos.audit.query(filter);
  }

  recent(limit = 10) {
    return this.repos.audit.recent(limit);
  }
}

/** Best-effort client IP extraction from forwarding headers. */
export function clientIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip");
}
