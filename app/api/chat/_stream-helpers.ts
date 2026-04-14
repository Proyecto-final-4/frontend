import type { Interrupt } from "@langchain/langgraph-sdk";

export type SendFn = (data: Record<string, unknown>) => Promise<void>;

type RawChunk = {
  event: string;
  data: unknown;
};

/**
 * Adapts LangGraph SDK stream events into a set of structured SSE events.
 *
 * Stream modes consumed: "messages", "tools", "tasks"
 *
 * Emitted SSE event shapes:
 *   { type: "token",      content: string }                       — cumulative AI text
 *   { type: "tool_start", toolCallId, name, input }               — tool invocation started
 *   { type: "tool_end",   toolCallId, name, result }              — tool completed
 *   { type: "tool_error", toolCallId, name, error }               — tool failed
 *   { type: "interrupt",  interruptId?, value }                   — HITL / graph interrupt
 *   { type: "done" }                                               — run finished
 *   { type: "error",      message }                               — fatal run error
 */
export async function buildSSEStream(
  runStream: AsyncIterable<RawChunk>,
  send: SendFn,
): Promise<void> {
  for await (const chunk of runStream) {
    // ── Fatal run error ──────────────────────────────────────────────────────
    if (chunk.event === "error") {
      const d = chunk.data as { message?: string; error?: string } | string;
      const msg = typeof d === "string" ? d : (d?.message ?? d?.error ?? "Unknown agent error");
      console.error("[stream-helpers] run error:", msg);
      await send({ type: "error", message: msg });
      return;
    }

    // ── AI text tokens (cumulative) ──────────────────────────────────────────
    if (chunk.event === "messages/partial") {
      const msgs = chunk.data as Array<{
        type: string;
        content: string | Array<{ type: string; text?: string }>;
      }>;

      for (const msg of msgs) {
        if (msg.type !== "ai") continue;

        const text =
          typeof msg.content === "string"
            ? msg.content
            : msg.content
                .filter((c) => c.type === "text")
                .map((c) => c.text ?? "")
                .join("");

        if (text) await send({ type: "token", content: text });
      }
    }

    // ── Tool lifecycle events ─────────────────────────────────────────────────
    if (chunk.event === "tools") {
      const d = chunk.data as {
        event: string;
        toolCallId?: string;
        name: string;
        input?: unknown;
        output?: unknown;
        error?: unknown;
      };

      const id = d.toolCallId ?? d.name;

      if (d.event === "on_tool_start") {
        await send({ type: "tool_start", toolCallId: id, name: d.name, input: d.input });
      } else if (d.event === "on_tool_end") {
        await send({ type: "tool_end", toolCallId: id, name: d.name, result: d.output });
      } else if (d.event === "on_tool_error") {
        await send({ type: "tool_error", toolCallId: id, name: d.name, error: d.error });
      }
    }

    // ── Task interrupts (HITL) ────────────────────────────────────────────────
    if (chunk.event === "tasks") {
      const d = chunk.data as {
        id: string;
        name: string;
        interrupts?: Interrupt[];
      };

      if (d.interrupts && d.interrupts.length > 0) {
        for (const interrupt of d.interrupts) {
          await send({
            type: "interrupt",
            interruptId: interrupt.id ?? undefined,
            value: interrupt.value,
          });
        }
      }
    }
  }

  await send({ type: "done" });
}
