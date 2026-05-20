"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { sidebarNavLinkClasses } from "@/shared/constants/nav";

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

  return (
    <section className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden">
      <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
        Conversaciones
      </p>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto">
        {!loaded ? (
          <p className="px-4 text-xs text-muted-foreground">Cargando...</p>
        ) : threads.length === 0 ? (
          <p className="px-4 text-xs text-muted-foreground">Sin conversaciones aún</p>
        ) : (
          threads.map((thread) => {
            const title = (thread.metadata?.title as string | undefined) ?? "Conversación";
            const isActive = thread.thread_id === activeThreadId;
            const isEditing = editingId === thread.thread_id;

            return (
              <div
                key={thread.thread_id}
                onClick={() => !isEditing && router.push(`/?thread=${thread.thread_id}`)}
                className={cn(
                  "relative w-full min-w-0 cursor-pointer py-2.5 text-left",
                  isEditing ? "flex items-center gap-1.5 px-3" : sidebarNavLinkClasses(isActive),
                  !isEditing && "px-3",
                )}
              >
                {isEditing ? (
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
                      className="min-w-0 flex-grow rounded-lg border border-outline-variant/40 bg-surface-container px-2 py-0.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <button
                      onClick={(e) => void confirmRename(e)}
                      className="flex-shrink-0 rounded-lg p-1 text-primary transition-colors hover:bg-primary/10"
                      title="Guardar"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-shrink-0 rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high"
                      title="Cancelar"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="block min-w-0 truncate pr-14">{title}</span>
                    <span
                      className={cn(
                        "pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-transparent bg-accent/90 px-0.5 opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100",
                        isActive && "pointer-events-auto bg-primary/15 opacity-100",
                      )}
                    >
                      <button
                        type="button"
                        onClick={(e) => startEdit(e, thread)}
                        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
                        title="Renombrar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => void handleDelete(e, thread.thread_id)}
                        className={cn(
                          "rounded-lg p-1 text-muted-foreground transition-colors hover:bg-background/60 hover:text-destructive",
                          deleting === thread.thread_id && "animate-pulse",
                        )}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
