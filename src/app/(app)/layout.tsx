import { requireUser } from "@/lib/server/context";
import { AppFrame } from "@/components/layout/AppFrame";
import type { AccessSnapshot } from "@/lib/rbac/access-context";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, permissions } = await requireUser();

  const snapshot: AccessSnapshot = {
    profile,
    permissions: Array.from(permissions),
  };

  return <AppFrame snapshot={snapshot}>{children}</AppFrame>;
}
