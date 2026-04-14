"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowUp, Sparkles } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { InterruptBubble } from "./InterruptBubble";
import type { ChatMessage, AssistantPart } from "@/types/chat";
import { emptyAssistantParts, applyToken, applyToolUpdate } from "@/lib/chat-reducers";

const PROMPT_CHIPS = ["Verificar patrimonio", "Top gastos del mes", "Predicciones de ahorro"];

interface Props {
  userName?: string;
  initialThreadId?: string;
}

// ── SSE event shapes from /api/chat/stream and /api/chat/resume ───────────────

type SseEvent =
  | { type: "thread"; id: string }
  | { type: "token"; content: string }
  | { type: "tool_start"; toolCallId: string; name: string; input?: unknown }
  | { type: "tool_end"; toolCallId: string; name: string; result?: unknown }
  | { type: "tool_error"; toolCallId: string; name: string; error?: unknown }
  | { type: "interrupt"; interruptId?: string; value: unknown }
  | { type: "done" }
  | { type: "error"; message: string };

/** Parse an SSE line of the form "data: {...}". */
function parseSseLine(line: string): SseEvent | null {
  if (!line.startsWith("data: ")) return null;
  try {
    return JSON.parse(line.slice(6)) as SseEvent;
  } catch {
    return null;
  }
}

export function ChatInterface({ userName, initialThreadId }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(!!initialThreadId);
  const [streamingParts, setStreamingParts] = useState<AssistantPart[] | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(initialThreadId ?? null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  // Load message history when opening an existing thread
  useEffect(() => {
    if (!initialThreadId) return;
    let cancelled = false;
    setLoadingHistory(true);
    fetch(`/api/threads/${initialThreadId}/history`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ChatMessage[]) => {
        if (!cancelled) {
          setMessages(data);
          setLoadingHistory(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingHistory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialThreadId]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingParts, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  // ── Core SSE consumer ───────────────────────────────────────────────────────

  const consumeStream = useCallback(
    async (response: Response, currentThreadId: string | null) => {
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let pendingThreadId: string | null = null;
      let parts = emptyAssistantParts();

      const flush = (updatedParts: AssistantPart[]) => {
        flushSync(() => setStreamingParts([...updatedParts]));
        scrollToBottom();
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const event = parseSseLine(line);
          if (!event) continue;

          switch (event.type) {
            case "thread": {
              setThreadId(event.id);
              if (!currentThreadId) pendingThreadId = event.id;
              break;
            }

            case "token": {
              parts = applyToken(parts, event.content);
              flush(parts);
              break;
            }

            case "tool_start": {
              // Ensure the tool_call part appears after any existing text part
              parts = [
                ...parts,
                {
                  kind: "tool_call",
                  toolCallId: event.toolCallId,
                  name: event.name,
                  input: event.input,
                  status: "running",
                },
              ];
              // Open a new text part after the tool call for subsequent tokens
              parts = [...parts, { kind: "text", content: "" }];
              flush(parts);
              break;
            }

            case "tool_end": {
              parts = applyToolUpdate(parts, event.toolCallId, {
                status: "done",
                result: event.result,
              });
              flush(parts);
              break;
            }

            case "tool_error": {
              parts = applyToolUpdate(parts, event.toolCallId, {
                status: "error",
                error: event.error,
              });
              flush(parts);
              break;
            }

            case "interrupt": {
              // Commit whatever is currently streaming as a finished assistant message
              flushSync(() => {
                const nonEmptyParts = parts.filter(
                  (p) => p.kind !== "text" || p.content.trim().length > 0,
                );
                if (nonEmptyParts.length > 0) {
                  setMessages((prev) => [
                    ...prev,
                    { id: `assistant-${Date.now()}`, role: "assistant", parts: nonEmptyParts },
                  ]);
                }
                // Add the interrupt as its own message
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `interrupt-${Date.now()}`,
                    role: "interrupt",
                    interruptId: event.interruptId,
                    value: event.value,
                  },
                ]);
                setStreamingParts(null);
              });
              parts = emptyAssistantParts();
              scrollToBottom();
              break;
            }

            case "done": {
              flushSync(() => {
                const nonEmptyParts = parts.filter(
                  (p) => p.kind !== "text" || p.content.trim().length > 0,
                );
                if (nonEmptyParts.length > 0) {
                  setMessages((prev) => [
                    ...prev,
                    { id: `assistant-${Date.now()}`, role: "assistant", parts: nonEmptyParts },
                  ]);
                }
                setStreamingParts(null);
              });
              if (pendingThreadId) {
                router.replace(`/?thread=${pendingThreadId}`);
                pendingThreadId = null;
              }
              scrollToBottom();
              break;
            }

            case "error": {
              console.error("[chat] agent error:", event.message);
              flushSync(() => {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `error-${Date.now()}`,
                    role: "assistant",
                    parts: [
                      {
                        kind: "text",
                        content: "Lo siento, ocurrió un error. Por favor intenta de nuevo.",
                      },
                    ],
                  },
                ]);
                setStreamingParts(null);
              });
              break;
            }
          }
        }
      }
    },
    [router, scrollToBottom],
  );

  // ── Send a new user message ─────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", content: trimmed },
      ]);
      setInput("");
      setIsStreaming(true);
      setStreamingParts(emptyAssistantParts());

      try {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, threadId }),
        });
        await consumeStream(res, threadId);
      } catch (err) {
        console.error("[chat] stream error:", err);
        flushSync(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              parts: [
                {
                  kind: "text",
                  content: "No pude conectar con el agente. Por favor intenta de nuevo.",
                },
              ],
            },
          ]);
          setStreamingParts(null);
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, threadId, consumeStream],
  );

  // ── Resume after a HITL interrupt ──────────────────────────────────────────

  const resumeInterrupt = useCallback(
    async (interruptMessageId: string, value: unknown) => {
      if (!threadId || isStreaming) return;

      // Mark the interrupt as resolved
      setMessages((prev) =>
        prev.map((m) =>
          m.id === interruptMessageId && m.role === "interrupt" ? { ...m, resolved: true } : m,
        ),
      );

      setIsStreaming(true);
      setStreamingParts(emptyAssistantParts());

      try {
        const res = await fetch("/api/chat/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId, value }),
        });
        await consumeStream(res, threadId);
      } catch (err) {
        console.error("[chat] resume error:", err);
        flushSync(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              parts: [
                {
                  kind: "text",
                  content: "No pude reanudar la conversación. Por favor intenta de nuevo.",
                },
              ],
            },
          ]);
          setStreamingParts(null);
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, threadId, consumeStream],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const hasMessages = messages.length > 0 || streamingParts !== null;
  const greeting = userName ? `Hola, ${userName}` : "Hola";

  return (
    <>
      {/* Message list or empty state */}
      {loadingHistory ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-on-surface-variant/50">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-medium">Cargando conversación…</p>
          </div>
        </div>
      ) : hasMessages ? (
        <div
          className="flex-grow overflow-y-auto px-6 py-6 space-y-4"
          style={{ paddingBottom: "9rem" }}
        >
          {messages.map((msg) => {
            if (msg.role === "user") {
              return <MessageBubble key={msg.id} role="user" content={msg.content} />;
            }
            if (msg.role === "assistant") {
              return <MessageBubble key={msg.id} role="assistant" parts={msg.parts} />;
            }
            if (msg.role === "interrupt") {
              return (
                <InterruptBubble
                  key={msg.id}
                  message={msg}
                  onResume={(value) => resumeInterrupt(msg.id, value)}
                />
              );
            }
            return null;
          })}

          {/* In-progress streaming message */}
          {streamingParts !== null && (
            <MessageBubble role="assistant" parts={streamingParts} isStreaming />
          )}

          <div ref={bottomRef} />
        </div>
      ) : (
        <section className="flex-grow flex flex-col items-center justify-center px-6 pb-40">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-3">
              {greeting}
            </h1>
            <p className="text-secondary text-base font-medium leading-relaxed">
              ¿Qué te gustaría hacer hoy?
            </p>
          </div>
        </section>
      )}

      {/* Input bar */}
      <div className="absolute bottom-0 left-0 w-full px-6 pb-6 pt-10 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto w-full pointer-events-auto">
          {/* Prompt chips — only when no messages */}
          {!hasMessages && !loadingHistory && (
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-0.5">
              {PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  disabled={isStreaming}
                  className="bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border border-outline-variant/30 flex-shrink-0 disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-lg px-3 py-2 gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming || loadingHistory}
              className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 font-medium text-sm outline-none py-1.5 resize-none leading-relaxed disabled:opacity-50 max-h-[120px] overflow-y-auto"
              placeholder="Pregunta cualquier cosa sobre tus finanzas..."
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isStreaming || loadingHistory || !input.trim()}
              className="bg-primary text-on-primary w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-90 active:scale-95 flex-shrink-0 mb-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center mt-3 text-[9px] text-on-surface-variant/30 font-bold uppercase tracking-[0.25em]">
            FinanzIA Intelligence Curator • 2026
          </p>
        </div>
      </div>
    </>
  );
}
