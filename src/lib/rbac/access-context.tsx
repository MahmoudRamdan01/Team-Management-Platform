"use client";

import { createContext, useContext, useMemo } from "react";
import type { Profile, Role } from "@/lib/repositories/types";
import type { PermissionKey } from "./permissions";
import { ROLE_RANK } from "./roles";

export interface AccessSnapshot {
  profile: Profile;
  permissions: PermissionKey[];
}

interface AccessValue {
  profile: Profile;
  permissions: Set<PermissionKey>;
  can: (p: PermissionKey) => boolean;
  roleAtLeast: (r: Role) => boolean;
}

const AccessContext = createContext<AccessValue | null>(null);

export function AccessProvider({ snapshot, children }: { snapshot: AccessSnapshot; children: React.ReactNode }) {
  const value = useMemo<AccessValue>(() => {
    const permissions = new Set(snapshot.permissions);
    return {
      profile: snapshot.profile,
      permissions,
      can: (p) => permissions.has(p),
      roleAtLeast: (r) => ROLE_RANK[snapshot.profile.role] >= ROLE_RANK[r],
    };
  }, [snapshot]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessValue {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used within AccessProvider");
  return ctx;
}
