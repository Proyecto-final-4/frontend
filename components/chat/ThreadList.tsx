"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Check, X } from "lucide-react";

interface Thread {
  thread_id: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface Props {
  activeThreadId?: string;
}

export function ThreadList({ activeThreadId }: Props) {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/threads");
      if (!res.ok) {
        console.error("[ThreadList] GET /api/threads →", res.status, await res.text());
        setLoaded(true);
        return;
      }
      const data = (await res.json()) as Thread[];
      setThreads(data);
    } catch (err) {
      console.error("[ThreadList] fetch failed:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads, activeThreadId]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const startEdit = (e: React.MouseEvent, thread: Thread) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(thread.thread_id);
    setEditValue((thread.metadata?.title as string | undefined) ?? "Conversación");
  };

  const cancelEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditValue("");
  };

  const confirmRename = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!editingId || !editValue.trim()) {
      cancelEdit();
      return;
    }
    const title = editValue.trim();
    setEditingId(null);
    setEditValue("");
    // Optimistic update
    setThreads((prev) =>
      prev.map((t) =>
        t.thread_id === editingId ? { ...t, metadata: { ...t.metadata, title } } : t,
      ),
    );
    try {
      await fetch(`/api/threads/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } catch {
      // Reload to get correct state on failure
      void loadThreads();
    }
  };

  const handleDelete = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleting(threadId);
    try {
      await fetch(`/api/threads/${threadId}`, { method: "DELETE" });
      setThreads((prev) => prev.filter((t) => t.thread_id !== threadId));
      if (activeThreadId === threadId) router.push("/");
    } finally {
      setDeleting(null);
    }
  };

  if (!loaded || threads.length === 0) return null;

  return (
    <div className="flex-grow overflow-y-auto space-y-0.5 mt-2 min-h-0">
      <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-2">
        Conversaciones
      </p>
      {threads.map((thread) => {
        const title = (thread.metadata?.title as string | undefined) ?? "Conversación";
        const isActive = thread.thread_id === activeThreadId;
        const isEditing = editingId === thread.thread_id;

        return (
          <div
            key={thread.thread_id}
            onClick={() => !isEditing && router.push(`/?thread=${thread.thread_id}`)}
            className={`group w-full flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-medium text-left transition-colors duration-150 cursor-pointer ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            {isEditing ? (
              /* ── Rename mode ── */
              <>
                <input
                  ref={editInputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void confirmRename();
                    if (e.key === "Escape") cancelEdit();
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-grow bg-surface-container border border-outline-variant/40 rounded-lg px-2 py-0.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary/50 min-w-0"
                />
                <button
                  onClick={(e) => void confirmRename(e)}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                  title="Guardar"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              /* ── Normal mode ── */
              <>
                <span className="flex-grow truncate">{title}</span>
                {/* Action buttons — visible on hover or when active */}
                <span className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span
                    role="button"
                    onClick={(e) => startEdit(e, thread)}
                    className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Renombrar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </span>
                  <span
                    role="button"
                    onClick={(e) => void handleDelete(e, thread.thread_id)}
                    className={`p-1 rounded-lg hover:text-error text-on-surface-variant transition-colors ${
                      deleting === thread.thread_id ? "animate-pulse" : ""
                    }`}
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
