"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { AuditAction } from "@/lib/repositories/types";

const ACTIONS: AuditAction[] = [
  "login",
  "logout",
  "login_failed",
  "register",
  "tool_access",
  "visibility_change",
  "permission_change",
  "role_change",
  "user_create",
  "user_update",
  "user_disable",
  "admin_action",
];

export function AuditFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("action") ?? "";

  return (
    <select
      className="input max-w-xs"
      value={current}
      onChange={(e) => {
        const sp = new URLSearchParams(params.toString());
        if (e.target.value) sp.set("action", e.target.value);
        else sp.delete("action");
        sp.delete("page");
        router.push(`/admin/audit?${sp.toString()}`);
      }}
    >
      <option value="">All actions</option>
      {ACTIONS.map((a) => (
        <option key={a} value={a}>
          {a.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}
