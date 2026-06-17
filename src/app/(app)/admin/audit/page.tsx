import Link from "next/link";
import { Suspense } from "react";
import { requirePermission } from "@/lib/server/context";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getServerI18n } from "@/lib/i18n/server";
import { AuditFilters } from "@/components/admin/AuditFilters";
import { relativeTime } from "@/lib/utils";
import type { AuditAction } from "@/lib/repositories/types";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string };
}) {
  const ctx = await requirePermission(PERMISSIONS.AUDIT_VIEW);
  const { t } = getServerI18n();

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const action = searchParams.action as AuditAction | undefined;
  const pageSize = 50;
  const result = await ctx.repos.audit.query({ page, pageSize, action });
  const pages = Math.max(1, Math.ceil(result.total / pageSize));

  const mkHref = (p: number) => {
    const sp = new URLSearchParams();
    if (action) sp.set("action", action);
    sp.set("page", String(p));
    return `/admin/audit?${sp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-brand text-2xl font-bold text-foam sm:text-3xl">{t("admin.auditTitle")}</h1>
          <p className="mt-1 font-mono text-xs text-mist">{result.total} entries</p>
        </div>
        <Suspense>
          <AuditFilters />
        </Suspense>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/10 font-mono text-[0.56rem] uppercase tracking-widest text-mist">
              <th className="p-3 text-start">When</th>
              <th className="p-3 text-start">Actor</th>
              <th className="p-3 text-start">Action</th>
              <th className="p-3 text-start">Target</th>
              <th className="p-3 text-start">IP</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((e) => (
              <tr key={String(e.id)} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-3 text-mist" title={e.createdAt}>
                  {relativeTime(e.createdAt)}
                </td>
                <td className="p-3 text-foam">{e.actorUsername || "system"}</td>
                <td className="p-3">
                  <span className="font-mono text-xs text-gold">{e.action}</span>
                </td>
                <td className="p-3 text-mist">{e.targetId ? `${e.targetType}/${e.targetId}` : "—"}</td>
                <td className="p-3 font-mono text-xs text-mist">{e.ip ?? "—"}</td>
              </tr>
            ))}
            {result.items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-mist">
                  No audit entries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link href={mkHref(page - 1)} className="btn-ghost px-4 py-2">
              ← Prev
            </Link>
          )}
          <span className="font-mono text-xs text-mist">
            {page} / {pages}
          </span>
          {page < pages && (
            <Link href={mkHref(page + 1)} className="btn-ghost px-4 py-2">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
