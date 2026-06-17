import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuditRepository } from "./audit.repository";
import type { NotificationRepository } from "./notification.repository";
import type { PresenceRepository } from "./presence.repository";
import type { ToolRepository } from "./tool.repository";
import type { UserRepository } from "./user.repository";
import type { VisibilityRepository } from "./visibility.repository";

import { SupabaseAuditRepository } from "./supabase/audit.supabase";
import { SupabaseNotificationRepository } from "./supabase/notification.supabase";
import { SupabasePresenceRepository } from "./supabase/presence.supabase";
import { SupabaseToolRepository } from "./supabase/tool.supabase";
import { SupabaseUserRepository } from "./supabase/user.supabase";
import { SupabaseVisibilityRepository } from "./supabase/visibility.supabase";

/**
 * The repository registry. Services depend only on this interface, never on the
 * concrete Supabase implementations — so migrating to a REST/NestJS backend
 * later means writing a parallel `makeRestRepositories()` and flipping the line
 * in `getRepositories()`. This is the single swap seam for the data layer.
 */
export interface Repositories {
  users: UserRepository;
  tools: ToolRepository;
  visibility: VisibilityRepository;
  audit: AuditRepository;
  notifications: NotificationRepository;
  presence: PresenceRepository;
}

export function makeSupabaseRepositories(db: SupabaseClient): Repositories {
  return {
    users: new SupabaseUserRepository(db),
    tools: new SupabaseToolRepository(db),
    visibility: new SupabaseVisibilityRepository(db),
    audit: new SupabaseAuditRepository(db),
    notifications: new SupabaseNotificationRepository(db),
    presence: new SupabasePresenceRepository(db),
  };
}

/**
 * Resolve the active backend. Today it is always Supabase; the indirection keeps
 * call sites backend-agnostic.
 */
export function getRepositories(db: SupabaseClient): Repositories {
  return makeSupabaseRepositories(db);
}

export type { UserRepository, ToolRepository, VisibilityRepository, AuditRepository, NotificationRepository, PresenceRepository };
