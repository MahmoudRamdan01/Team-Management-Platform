"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, KeyRound } from "lucide-react";
import type { Profile, Role } from "@/lib/repositories/types";
import { DEPARTMENTS, DEPARTMENT_MAP } from "@/lib/constants/departments";
import { ROLES, ROLE_LABELS, canManageRole } from "@/lib/rbac/roles";

export function UsersTable({ users: initial, actorRole }: { users: Profile[]; actorRole: Role }) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [tempPw, setTempPw] = useState<{ password: string; email: string } | null>(null);
  const [add, setAdd] = useState({ fullName: "", username: "", dept: "operations", role: "employee" as Role });

  const assignableRoles = ROLES.filter((r) => canManageRole(actorRole, r));

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((u) => u.map((x) => (x.id === id ? data.user : x)));
        router.refresh();
      } else {
        alert(data.error ?? "Failed");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function create() {
    setBusyId("__new__");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(add),
      });
      const data = await res.json();
      if (res.ok) {
        setTempPw({ password: data.tempPassword, email: data.email });
        setShowAdd(false);
        setAdd({ fullName: "", username: "", dept: "operations", role: "employee" });
        router.refresh();
      } else {
        alert(data.error ?? "Failed");
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd((s) => !s)} className="btn-gold inline-flex items-center gap-2 text-sm">
          <Plus size={16} /> New user
        </button>
      </div>

      {tempPw && (
        <div className="card flex items-center gap-3 border-gold/40 p-4 text-sm">
          <KeyRound size={18} className="shrink-0 text-gold" />
          <span className="text-foam">
            Login: <span className="font-mono text-gold">{tempPw.email}</span> · temp password:{" "}
            <span className="font-mono text-gold">{tempPw.password}</span> — share it; they change it on first login.
          </span>
          <button onClick={() => setTempPw(null)} className="ms-auto text-mist hover:text-foam">
            ✕
          </button>
        </div>
      )}

      {showAdd && (
        <div className="card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
          <input className="input" placeholder="Full name" value={add.fullName} onChange={(e) => setAdd({ ...add, fullName: e.target.value })} />
          <input
            className="input"
            placeholder="username → @airocean.com"
            value={add.username}
            onChange={(e) => setAdd({ ...add, username: e.target.value })}
          />
          <select className="input" value={add.dept} onChange={(e) => setAdd({ ...add, dept: e.target.value })}>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameEn}
              </option>
            ))}
          </select>
          <select className="input" value={add.role} onChange={(e) => setAdd({ ...add, role: e.target.value as Role })}>
            {assignableRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r].en}
              </option>
            ))}
          </select>
          <button onClick={create} disabled={busyId === "__new__"} className="btn-gold flex items-center justify-center gap-2">
            {busyId === "__new__" ? <Loader2 size={16} className="animate-spin" /> : "Create"}
          </button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/10 font-mono text-[0.58rem] uppercase tracking-widest text-mist">
              <th className="p-3 text-start">User</th>
              <th className="p-3 text-start">Department</th>
              <th className="p-3 text-start">Role</th>
              <th className="p-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const manageable = canManageRole(actorRole, u.role);
              return (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3">
                    <div className="font-medium text-foam">{u.fullName}</div>
                    <div className="font-mono text-[0.6rem] text-mist">@{u.username}</div>
                  </td>
                  <td className="p-3">
                    <select
                      className="input py-1.5 text-xs"
                      value={u.dept}
                      disabled={!manageable || busyId === u.id}
                      onChange={(e) => patch(u.id, { dept: e.target.value })}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {DEPARTMENT_MAP[d.id]?.nameEn}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      className="input py-1.5 text-xs"
                      value={u.role}
                      disabled={!manageable || busyId === u.id}
                      onChange={(e) => patch(u.id, { role: e.target.value })}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} disabled={!canManageRole(actorRole, r)}>
                          {ROLE_LABELS[r].en}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      disabled={!manageable || busyId === u.id}
                      onClick={() => patch(u.id, { status: u.status === "active" ? "disabled" : "active" })}
                      className={`pill border ${u.status === "active" ? "border-[#43D9A04d] text-ops" : "border-[#e54d4d80] text-[#ff9d9d]"}`}
                    >
                      {u.status}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
