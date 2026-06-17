"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import type { Profile, Tool, VisibilityRule, VisibilityScope } from "@/lib/repositories/types";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { ROLES, ROLE_LABELS } from "@/lib/rbac/roles";

export function VisibilityEditor({
  tools,
  users,
  rules: initialRules,
}: {
  tools: Tool[];
  users: Profile[];
  rules: VisibilityRule[];
}) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{ toolId: string; scope: VisibilityScope; subject: string; visible: boolean }>({
    toolId: tools[0]?.id ?? "",
    scope: "department",
    subject: DEPARTMENTS[0]?.id ?? "",
    visible: true,
  });

  const subjectOptions =
    form.scope === "user"
      ? users.map((u) => ({ value: u.id, label: `${u.fullName} (@${u.username})` }))
      : form.scope === "role"
        ? ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r].en }))
        : DEPARTMENTS.map((d) => ({ value: d.id, label: d.nameEn }));

  async function addRule() {
    if (!form.toolId || !form.subject) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setRules((r) => [...r.filter((x) => x.id !== data.rule.id), data.rule]);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeRule(id: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/visibility", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setRules((r) => r.filter((x) => x.id !== id));
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  const toolName = (id: string) => tools.find((t) => t.id === id)?.name ?? id;
  const subjectLabel = (rule: VisibilityRule) => {
    if (rule.scope === "user") return users.find((u) => u.id === rule.subject)?.username ?? rule.subject;
    if (rule.scope === "role") return rule.subject;
    return DEPARTMENTS.find((d) => d.id === rule.subject)?.nameEn ?? rule.subject;
  };

  return (
    <div className="space-y-6">
      {/* Add rule */}
      <div className="card p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select className="input" value={form.toolId} onChange={(e) => setForm((f) => ({ ...f, toolId: e.target.value }))}>
            {tools.map((tl) => (
              <option key={tl.id} value={tl.id}>
                {tl.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={form.scope}
            onChange={(e) => {
              const scope = e.target.value as VisibilityScope;
              const first =
                scope === "user" ? users[0]?.id : scope === "role" ? ROLES[0] : DEPARTMENTS[0]?.id;
              setForm((f) => ({ ...f, scope, subject: first ?? "" }));
            }}
          >
            <option value="department">Department</option>
            <option value="role">Role</option>
            <option value="user">User</option>
          </select>

          <select className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
            {subjectOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={form.visible ? "1" : "0"}
            onChange={(e) => setForm((f) => ({ ...f, visible: e.target.value === "1" }))}
          >
            <option value="1">Visible</option>
            <option value="0">Hidden</option>
          </select>

          <button onClick={addRule} disabled={busy} className="btn-gold flex items-center justify-center gap-2">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add rule
          </button>
        </div>
        <p className="mt-3 font-mono text-[0.6rem] tracking-wider text-mist">
          PRECEDENCE: USER &gt; ROLE &gt; DEPARTMENT &gt; TOOL DEFAULT
        </p>
      </div>

      {/* Rules table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-start font-mono text-[0.58rem] uppercase tracking-widest text-mist">
              <th className="p-3 text-start">Tool</th>
              <th className="p-3 text-start">Scope</th>
              <th className="p-3 text-start">Subject</th>
              <th className="p-3 text-start">State</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-3 text-foam">{toolName(rule.toolId)}</td>
                <td className="p-3 capitalize text-mist">{rule.scope}</td>
                <td className="p-3 text-mist">{subjectLabel(rule)}</td>
                <td className="p-3">
                  {rule.visible ? (
                    <span className="inline-flex items-center gap-1.5 text-ops">
                      <Eye size={14} /> Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[#ff9d9d]">
                      <EyeOff size={14} /> Hidden
                    </span>
                  )}
                </td>
                <td className="p-3 text-end">
                  <button onClick={() => removeRule(rule.id)} className="text-mist hover:text-[#ff9d9d]" aria-label="delete rule">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-mist">
                  No custom rules — tools fall back to their default minimum role.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
