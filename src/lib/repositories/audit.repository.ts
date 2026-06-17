import type { AuditEntry, AuditFilter, NewAuditEntry, Page } from "./types";

export interface AuditRepository {
  log(entry: NewAuditEntry): Promise<void>;
  query(filter: AuditFilter): Promise<Page<AuditEntry>>;
  recent(limit: number): Promise<AuditEntry[]>;
}
