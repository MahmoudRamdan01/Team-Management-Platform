"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, MessageSquare, Loader2, Send } from "lucide-react";
import type { Task, TaskComment, TaskStatus } from "@/lib/repositories/types";
import { useI18n } from "@/lib/i18n/context";
import { relativeTime } from "@/lib/utils";

const PRIORITY_COLOR: Record<string, string> = { low: "#94A7B8", medium: "#4FC3F7", high: "#FF8E5E", urgent: "#e54d4d" };
const STATUS_COLOR: Record<string, string> = { todo: "#94A7B8", in_progress: "#F7B733", done: "#43D9A0" };

export function TasksView({
  mine,
  managed,
  canManage,
  users,
}: {
  mine: Task[];
  managed: Task[];
  canManage: boolean;
  users: { id: string; fullName: string; username: string }[];
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"mine" | "managed">("mine");

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex gap-2">
          <button
            onClick={() => setTab("mine")}
            className={`rounded-full px-4 py-1.5 text-sm ${tab === "mine" ? "bg-gold-soft text-gold" : "text-mist hover:text-foam"}`}
          >
            {t("tasks.mine")}
          </button>
          <button
            onClick={() => setTab("managed")}
            className={`rounded-full px-4 py-1.5 text-sm ${tab === "managed" ? "bg-gold-soft text-gold" : "text-mist hover:text-foam"}`}
          >
            {t("tasks.managed")}
          </button>
        </div>
      )}

      {tab === "mine" && <MyTasks tasks={mine} />}
      {tab === "managed" && canManage && <ManagedTasks tasks={managed} users={users} />}
    </div>
  );
}

function PriorityBadge({ p }: { p: string }) {
  return (
    <span className="pill border" style={{ color: PRIORITY_COLOR[p], borderColor: `${PRIORITY_COLOR[p]}66` }}>
      {p.toUpperCase()}
    </span>
  );
}

function MyTasks({ tasks: initial }: { tasks: Task[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [tasks, setTasks] = useState(initial);

  async function patch(id: string, body: Record<string, unknown>) {
    setTasks((xs) => xs.map((x) => (x.id === id ? { ...x, ...mapPatch(body) } : x)));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
    router.refresh();
  }

  if (tasks.length === 0) return <div className="card p-10 text-center text-mist">{t("tasks.empty")}</div>;

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[task.status] }} />
                <h3 className="font-brand font-semibold text-foam">{task.title}</h3>
                <PriorityBadge p={task.priority} />
              </div>
              {task.description && <p className="mt-1.5 text-sm text-mist">{task.description}</p>}
              {task.dueDate && (
                <p className="mt-1 font-mono text-[0.62rem] text-mist">
                  {t("tasks.due")}: {new Date(task.dueDate).toLocaleDateString(locale)}
                </p>
              )}
            </div>
            <select
              className="input max-w-[160px] py-1.5 text-xs"
              value={task.status}
              onChange={(e) => patch(task.id, { status: e.target.value as TaskStatus })}
            >
              <option value="todo">{t("tasks.todo")}</option>
              <option value="in_progress">{t("tasks.inProgress")}</option>
              <option value="done">{t("tasks.done")}</option>
            </select>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={task.progress}
              onChange={(e) => setTasks((xs) => xs.map((x) => (x.id === task.id ? { ...x, progress: Number(e.target.value) } : x)))}
              onMouseUp={(e) => patch(task.id, { progress: Number((e.target as HTMLInputElement).value) })}
              onTouchEnd={(e) => patch(task.id, { progress: Number((e.target as HTMLInputElement).value) })}
              className="flex-1 accent-gold"
            />
            <span className="w-10 text-end font-mono text-xs text-foam">{task.progress}%</span>
          </div>

          <Comments taskId={task.id} />
        </div>
      ))}
    </div>
  );
}

function ManagedTasks({
  tasks: initial,
  users,
}: {
  tasks: Task[];
  users: { id: string; fullName: string; username: string }[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [tasks, setTasks] = useState(initial);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assigneeId: users[0]?.id ?? "", priority: "medium", dueDate: "" });

  async function create() {
    if (!form.title || !form.assigneeId) return;
    setBusy(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          assigneeId: form.assigneeId,
          priority: form.priority,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTasks((xs) => [data.task, ...xs]);
        setForm({ ...form, title: "", description: "", dueDate: "" });
        setShow(false);
        router.refresh();
      } else alert(data.error ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function del(id: string) {
    setTasks((xs) => xs.filter((x) => x.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" }).catch(() => {});
    router.refresh();
  }

  const userName = (id: string) => users.find((u) => u.id === id)?.fullName ?? "—";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShow((s) => !s)} className="btn-gold inline-flex items-center gap-2 text-sm">
          <Plus size={16} /> {t("tasks.create")}
        </button>
      </div>

      {show && (
        <div className="card grid gap-3 p-5 sm:grid-cols-2">
          <input className="input sm:col-span-2" placeholder={t("tasks.titleField")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input sm:col-span-2" rows={2} placeholder={t("tasks.desc")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="input" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} (@{u.username})
              </option>
            ))}
          </select>
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">{t("tasks.low")}</option>
            <option value="medium">{t("tasks.medium")}</option>
            <option value="high">{t("tasks.high")}</option>
            <option value="urgent">{t("tasks.urgent")}</option>
          </select>
          <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <button onClick={create} disabled={busy} className="btn-gold flex items-center justify-center gap-2">
            {busy ? <Loader2 size={16} className="animate-spin" /> : t("tasks.create")}
          </button>
        </div>
      )}

      {tasks.length === 0 && <div className="card p-10 text-center text-mist">{t("tasks.empty")}</div>}
      {tasks.map((task) => (
        <div key={task.id} className="card flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[task.status] }} />
              <h3 className="truncate font-medium text-foam">{task.title}</h3>
              <PriorityBadge p={task.priority} />
            </div>
            <p className="mt-0.5 font-mono text-[0.62rem] text-mist">
              {userName(task.assigneeId)} · {task.progress}% · {task.dueDate ? new Date(task.dueDate).toLocaleDateString(locale) : "—"}
            </p>
          </div>
          <button onClick={() => del(task.id)} className="text-mist hover:text-[#ff9d9d]" aria-label="delete">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Comments({ taskId }: { taskId: string }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<TaskComment[] | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && list === null) {
      const res = await fetch(`/api/tasks/${taskId}/comments`).catch(() => null);
      const data = res && res.ok ? await res.json() : { comments: [] };
      setList(data.comments ?? []);
    }
  }

  async function add() {
    if (!body.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (res.ok) {
        setList((xs) => [...(xs ?? []), data.comment]);
        setBody("");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <button onClick={toggle} className="flex items-center gap-1.5 text-xs text-mist hover:text-gold">
        <MessageSquare size={13} /> {t("tasks.comments")}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {(list ?? []).map((c) => (
            <div key={c.id} className="rounded-lg bg-white/[0.03] p-2.5 text-sm">
              <span className="text-foam">{c.body}</span>
              <span className="ms-2 font-mono text-[0.56rem] text-mist">
                @{c.authorUsername} · {relativeTime(c.createdAt, locale)}
              </span>
            </div>
          ))}
          <div className="flex gap-2">
            <input className="input flex-1 py-1.5 text-sm" value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("tasks.addComment")} />
            <button onClick={add} disabled={busy} className="btn-gold px-3 py-1.5">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function mapPatch(body: Record<string, unknown>): Partial<Task> {
  const p: Partial<Task> = {};
  if (typeof body.status === "string") p.status = body.status as TaskStatus;
  if (typeof body.progress === "number") {
    p.progress = body.progress;
    if (body.progress === 100) p.status = "done";
  }
  return p;
}
