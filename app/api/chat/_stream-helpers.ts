import type { Interrupt } from "@langchain/langgraph-sdk";

export type SendFn = (data: Record<string, unknown>) => Promise<void>;

type RawChunk = {
  event: string;
  data: unknown;
};

/**
 * Tools that map to delegated sub-agents.
 * Their internal response tokens are suppressed; only the ToolCallBubble is shown.
 */
const SUB_AGENT_PATTERN = /_agent$/;

function isSubAgent(name: string): boolean {
  return SUB_AGENT_PATTERN.test(name);
}

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
  // Active sub-agent counter. While > 0, tokens are suppressed.
  let activeSubAgents = 0;

  for await (const chunk of runStream) {
    // ── Fatal run error ──────────────────────────────────────────────────────
    if (chunk.event === "error") {
      const d = chunk.data as { message?: string; error?: string } | string;
      const msg = typeof d === "string" ? d : (d?.message ?? d?.error ?? "Unknown agent error");
      console.error("[stream-helpers] run error:", msg);
      await send({ type: "error", message: msg });
      return;
    }

    // ── Tool lifecycle events (via "events" stream mode) ─────────────────────
    // Processed BEFORE tokens so the sub-agent counter updates before their messages/partial.
    if (chunk.event === "events") {
      const d = chunk.data as {
        event: string;
        name?: string;
        run_id?: string;
        data?: { input?: unknown; output?: unknown; error?: unknown };
      };

      const id = d.run_id ?? d.name ?? "unknown";
      const name = d.name ?? "";

      if (d.event === "on_tool_start") {
        if (isSubAgent(name)) activeSubAgents++;
        await send({
          type: "tool_start",
          toolCallId: id,
          name,
          input: d.data?.input,
        });
      } else if (d.event === "on_tool_end") {
        if (isSubAgent(name)) activeSubAgents = Math.max(0, activeSubAgents - 1);
        await send({
          type: "tool_end",
          toolCallId: id,
          name,
          result: d.data?.output,
        });
      } else if (d.event === "on_tool_error") {
        if (isSubAgent(name)) activeSubAgents = Math.max(0, activeSubAgents - 1);
        await send({
          type: "tool_error",
          toolCallId: id,
          name,
          error: d.data?.error,
        });
      }
    }

    // ── AI text tokens (cumulative) ──────────────────────────────────────────
    // Omitted when they come from an active sub-agent.
    if (chunk.event === "messages/partial" && activeSubAgents === 0) {
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

    // ── Task interrupts via "updates" stream mode ─────────────────────────────
    if (chunk.event === "updates") {
      const d = chunk.data as Record<string, unknown>;
      const interrupts = d.__interrupt__ as Interrupt[] | undefined;

      if (interrupts && interrupts.length > 0) {
        for (const interrupt of interrupts) {
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
