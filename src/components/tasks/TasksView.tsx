"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, MessageSquare, Loader2, Send, Calendar, User, BarChart2 } from "lucide-react";
import type { Task, TaskComment, TaskStatus } from "@/lib/repositories/types";
import { useI18n } from "@/lib/i18n/context";
import { relativeTime } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <div className="space-y-8 view-in">
      {canManage && (
        <div className="flex p-1 bg-white/5 border border-white/5 rounded-2xl w-fit">
          <button
            onClick={() => setTab("mine")}
            className={cn(
              "rounded-xl px-6 py-2 text-sm font-bold transition-all duration-300",
              tab === "mine" ? "bg-gold text-gold-ink shadow-lg shadow-gold/20" : "text-mist hover:text-white"
            )}
          >
            {t("tasks.mine")}
          </button>
          <button
            onClick={() => setTab("managed")}
            className={cn(
              "rounded-xl px-6 py-2 text-sm font-bold transition-all duration-300",
              tab === "managed" ? "bg-gold text-gold-ink shadow-lg shadow-gold/20" : "text-mist hover:text-white"
            )}
          >
            {t("tasks.managed")}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {tab === "mine" && <MyTasks tasks={mine} />}
          {tab === "managed" && canManage && <ManagedTasks tasks={managed} users={users} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PriorityBadge({ p }: { p: string }) {
  return (
    <span 
      className="px-2 py-0.5 rounded-md text-[0.6rem] font-black uppercase tracking-widest border" 
      style={{ color: PRIORITY_COLOR[p], borderColor: `${PRIORITY_COLOR[p]}33`, background: `${PRIORITY_COLOR[p]}10` }}
    >
      {p}
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

  if (tasks.length === 0) return (
    <div className="rounded-[32px] border border-dashed border-white/10 p-20 text-center">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-mist mb-4">
        <CheckSquare size={32} />
      </div>
      <p className="text-mist font-medium">{t("tasks.empty")}</p>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {tasks.map((task) => (
        <motion.div 
          layout
          key={task.id} 
          className="group rounded-[28px] border border-white/5 bg-[#0C1218]/50 p-6 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-[#0C1218]/80 shadow-xl shadow-black/20"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: STATUS_COLOR[task.status] }} />
                  <h3 className="font-brand text-lg font-bold text-white group-hover:text-gold transition-colors">{task.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PriorityBadge p={task.priority} />
                  {task.dueDate && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-[0.65rem] text-mist font-mono">
                      <Calendar size={10} />
                      {new Date(task.dueDate).toLocaleDateString(locale)}
                    </span>
                  )}
                </div>
              </div>
              <select
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-gold transition-all"
                value={task.status}
                onChange={(e) => patch(task.id, { status: e.target.value as TaskStatus })}
              >
                <option value="todo">{t("tasks.todo")}</option>
                <option value="in_progress">{t("tasks.inProgress")}</option>
                <option value="done">{t("tasks.done")}</option>
              </select>
            </div>

            {task.description && (
              <p className="text-sm text-mist/80 leading-relaxed mb-6 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between text-[0.65rem] font-mono text-mist">
                <span className="flex items-center gap-1.5"><BarChart2 size={12} /> PROGRESS</span>
                <span className="font-bold text-white bg-gold/20 px-2 py-0.5 rounded text-gold">{task.progress}%</span>
              </div>
              <div className="relative h-2 rounded-full bg-white/5 border border-white/5 p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-gold/50 to-gold relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </motion.div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={task.progress}
                  onChange={(e) => setTasks((xs) => xs.map((x) => (x.id === task.id ? { ...x, progress: Number(e.target.value) } : x)))}
                  onMouseUp={(e) => patch(task.id, { progress: Number((e.target as HTMLInputElement).value) })}
                  onTouchEnd={(e) => patch(task.id, { progress: Number((e.target as HTMLInputElement).value) })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <Comments taskId={task.id} />
          </div>
        </motion.div>
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
    if (!confirm("Are you sure?")) return;
    setTasks((xs) => xs.filter((x) => x.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" }).catch(() => {});
    router.refresh();
  }

  const userName = (id: string) => users.find((u) => u.id === id)?.fullName ?? "—";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">{t("tasks.managed")}</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShow((s) => !s)} 
          className="btn-gold flex items-center gap-2 px-5 py-2.5 shadow-lg shadow-gold/20"
        >
          <Plus size={18} /> <span>{t("tasks.create")}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-[28px] border border-gold/20 bg-gold/5 p-8 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="label">{t("tasks.titleField")}</label>
                <input className="input bg-ink/50" placeholder="مثلاً: مراجعة بوالص الشحن..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="label">{t("tasks.desc")}</label>
                <textarea className="input bg-ink/50" rows={3} placeholder="تفاصيل المهمة..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="label">المسؤول</label>
                <select className="input bg-ink/50" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="label">الأولوية</label>
                <select className="input bg-ink/50" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">{t("tasks.low")}</option>
                  <option value="medium">{t("tasks.medium")}</option>
                  <option value="high">{t("tasks.high")}</option>
                  <option value="urgent">{t("tasks.urgent")}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="label">تاريخ الاستحقاق</label>
                <input className="input bg-ink/50" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="flex items-end">
                <button onClick={create} disabled={busy} className="btn-gold w-full flex items-center justify-center gap-2 py-3">
                  {busy ? <Loader2 size={20} className="animate-spin" /> : t("tasks.create")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="group rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center justify-between gap-4 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <User size={18} className="text-mist" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-bold text-white text-sm">{task.title}</h3>
                  <PriorityBadge p={task.priority} />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[0.7rem] text-gold font-bold">{userName(task.assigneeId)}</span>
                  <span className="text-[0.7rem] text-mist font-mono flex items-center gap-1">
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gold" style={{ width: `${task.progress}%` }} />
                    </div>
                    {task.progress}%
                  </span>
                  {task.dueDate && (
                    <span className="text-[0.7rem] text-mist/50 font-mono">
                      Due: {new Date(task.dueDate).toLocaleDateString(locale)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={() => del(task.id)} 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-mist hover:text-red-400 hover:bg-red-400/10 transition-all" 
              aria-label="delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
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
    <div className="mt-6 pt-4 border-t border-white/5">
      <button 
        onClick={toggle} 
        className={cn(
          "flex items-center gap-2 text-xs font-bold transition-colors",
          open ? "text-gold" : "text-mist hover:text-white"
        )}
      >
        <MessageSquare size={14} /> 
        <span>{t("tasks.comments")}</span>
        {list && list.length > 0 && <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{list.length}</span>}
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3 overflow-hidden"
          >
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 no-scrollbar">
              {(list ?? []).map((c) => (
                <div key={c.id} className="rounded-2xl bg-white/5 p-3 text-sm border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[0.65rem] font-bold text-gold">@{c.authorUsername}</span>
                    <span className="text-[0.6rem] font-mono text-mist/50">{relativeTime(c.createdAt, locale)}</span>
                  </div>
                  <p className="text-white/90 text-xs leading-relaxed">{c.body}</p>
                </div>
              ))}
              {list && list.length === 0 && <p className="text-[0.7rem] text-mist/50 italic text-center py-2">No comments yet</p>}
            </div>
            
            <div className="flex gap-2 bg-ink/50 p-1.5 rounded-2xl border border-white/5 focus-within:border-gold/30 transition-colors">
              <input 
                className="flex-1 bg-transparent border-none px-3 py-1.5 text-xs text-white outline-none placeholder:text-mist/30" 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                placeholder={t("tasks.addComment")} 
              />
              <button 
                onClick={add} 
                disabled={busy || !body.trim()} 
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gold text-gold-ink disabled:opacity-30 disabled:grayscale transition-all"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

function CheckSquare({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
