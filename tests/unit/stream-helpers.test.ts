import { describe, it, expect, vi } from "vitest";
import { buildSSEStream } from "@/app/api/chat/_stream-helpers";

// Helper: create an async iterable from an array of chunks
async function* makeStream(chunks: Array<{ event: string; data: unknown }>) {
  for (const chunk of chunks) yield chunk;
}

describe("buildSSEStream", () => {
  // ── Text tokens ────────────────────────────────────────────────────────────

  it("emits token events for ai messages/partial with string content", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        { event: "messages/partial", data: [{ type: "ai", content: "Hello" }] },
        { event: "messages/partial", data: [{ type: "ai", content: "Hello world" }] },
      ]),
      send,
    );
    expect(send).toHaveBeenCalledWith({ type: "token", content: "Hello" });
    expect(send).toHaveBeenCalledWith({ type: "token", content: "Hello world" });
    expect(send).toHaveBeenCalledWith({ type: "done" });
  });

  it("emits token events for ai messages/partial with array content", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        {
          event: "messages/partial",
          data: [
            {
              type: "ai",
              content: [
                { type: "text", text: "Part one " },
                { type: "text", text: "part two" },
              ],
            },
          ],
        },
      ]),
      send,
    );
    expect(send).toHaveBeenCalledWith({ type: "token", content: "Part one part two" });
  });

  it("ignores non-ai message types", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        { event: "messages/partial", data: [{ type: "human", content: "hi" }] },
        { event: "messages/partial", data: [{ type: "tool", content: "result" }] },
      ]),
      send,
    );
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "token" }));
    expect(send).toHaveBeenCalledWith({ type: "done" });
  });

  it("does not emit token when ai content is empty", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([{ event: "messages/partial", data: [{ type: "ai", content: "" }] }]),
      send,
    );
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "token" }));
  });

  // ── Tool events ────────────────────────────────────────────────────────────

  it("emits tool_start on on_tool_start", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        {
          event: "events",
          data: {
            event: "on_tool_start",
            run_id: "call-1",
            name: "get_transactions",
            data: { input: { limit: 10 } },
          },
        },
      ]),
      send,
    );
    expect(send).toHaveBeenCalledWith({
      type: "tool_start",
      toolCallId: "call-1",
      name: "get_transactions",
      input: { limit: 10 },
    });
  });

  it("emits tool_end on on_tool_end", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        {
          event: "events",
          data: {
            event: "on_tool_end",
            run_id: "call-1",
            name: "get_transactions",
            data: { output: [{ id: 1 }] },
          },
        },
      ]),
      send,
    );
    expect(send).toHaveBeenCalledWith({
      type: "tool_end",
      toolCallId: "call-1",
      name: "get_transactions",
      result: [{ id: 1 }],
    });
  });

  it("emits tool_error on on_tool_error", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        {
          event: "events",
          data: {
            event: "on_tool_error",
            run_id: "call-1",
            name: "get_transactions",
            data: { error: "timeout" },
          },
        },
      ]),
      send,
    );
    expect(send).toHaveBeenCalledWith({
      type: "tool_error",
      toolCallId: "call-1",
      name: "get_transactions",
      error: "timeout",
    });
  });

  it("falls back to tool name as id when toolCallId is absent", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        {
          event: "events",
          data: { event: "on_tool_start", name: "get_categories", data: { input: {} } },
        },
      ]),
      send,
    );
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ type: "tool_start", toolCallId: "get_categories" }),
    );
  });

  // ── Interrupts ─────────────────────────────────────────────────────────────

  it("emits interrupt for each interrupt in a tasks event", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        {
          event: "updates",
          data: {
            __interrupt__: [
              { id: "irq-1", value: "¿Confirmas el registro?" },
              { id: "irq-2", value: { type: "confirm", message: "Proceed?" } },
            ],
          },
        },
      ]),
      send,
    );
    expect(send).toHaveBeenCalledWith({
      type: "interrupt",
      interruptId: "irq-1",
      value: "¿Confirmas el registro?",
    });
    expect(send).toHaveBeenCalledWith({
      type: "interrupt",
      interruptId: "irq-2",
      value: { type: "confirm", message: "Proceed?" },
    });
  });

  it("does not emit interrupt when interrupts array is empty", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(makeStream([{ event: "updates", data: { __interrupt__: [] } }]), send);
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "interrupt" }));
  });

  it("does not emit interrupt when interrupts field is absent", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(makeStream([{ event: "updates", data: {} }]), send);
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "interrupt" }));
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("emits error and stops on error event with string data", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        { event: "error", data: "Agent crashed" },
        { event: "messages/partial", data: [{ type: "ai", content: "should not emit" }] },
      ]),
      send,
    );
    expect(send).toHaveBeenCalledWith({ type: "error", message: "Agent crashed" });
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "token" }));
    expect(send).not.toHaveBeenCalledWith({ type: "done" });
  });

  it("emits error and stops on error event with object data", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([{ event: "error", data: { message: "Rate limit exceeded" } }]),
      send,
    );
    expect(send).toHaveBeenCalledWith({ type: "error", message: "Rate limit exceeded" });
  });

  // ── Done ───────────────────────────────────────────────────────────────────

  it("always emits done after the stream ends without error", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(makeStream([]), send);
    expect(send).toHaveBeenCalledWith({ type: "done" });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("emits done after mixed token + tool events", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        { event: "messages/partial", data: [{ type: "ai", content: "Fetching..." }] },
        {
          event: "events",
          data: {
            event: "on_tool_start",
            run_id: "c1",
            name: "get_transactions",
            data: { input: {} },
          },
        },
        {
          event: "events",
          data: {
            event: "on_tool_end",
            run_id: "c1",
            name: "get_transactions",
            data: { output: [] },
          },
        },
        { event: "messages/partial", data: [{ type: "ai", content: "Done." }] },
      ]),
      send,
    );
    const calls = send.mock.calls.map((c) => c[0].type);
    expect(calls).toEqual(["token", "tool_start", "tool_end", "token", "done"]);
  });

  // ── Supresión de tokens de sub-agentes ─────────────────────────────────────

  it("suprime tokens de mensajes mientras un sub-agente está activo", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        // Coordinador habla antes
        { event: "messages/partial", data: [{ type: "ai", content: "Consultando..." }] },
        // Sub-agente inicia
        {
          event: "events",
          data: {
            event: "on_tool_start",
            run_id: "sa-1",
            name: "transactions_agent",
            data: { input: {} },
          },
        },
        // Token interno del sub-agente → debe suprimirse
        { event: "messages/partial", data: [{ type: "ai", content: "Respuesta interna" }] },
        // Sub-agente finaliza
        {
          event: "events",
          data: {
            event: "on_tool_end",
            run_id: "sa-1",
            name: "transactions_agent",
            data: { output: "resultado" },
          },
        },
        // Coordinador retoma → debe emitirse
        { event: "messages/partial", data: [{ type: "ai", content: "Listo." }] },
      ]),
      send,
    );
    const calls = send.mock.calls.map((c) => c[0]);
    expect(calls).toEqual([
      { type: "token", content: "Consultando..." },
      { type: "tool_start", toolCallId: "sa-1", name: "transactions_agent", input: {} },
      { type: "tool_end", toolCallId: "sa-1", name: "transactions_agent", result: "resultado" },
      { type: "token", content: "Listo." },
      { type: "done" },
    ]);
  });

  it("suprime tokens durante error de sub-agente y los restaura al terminar", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        {
          event: "events",
          data: {
            event: "on_tool_start",
            run_id: "sa-2",
            name: "budgets_agent",
            data: { input: {} },
          },
        },
        { event: "messages/partial", data: [{ type: "ai", content: "Token suprimido" }] },
        {
          event: "events",
          data: {
            event: "on_tool_error",
            run_id: "sa-2",
            name: "budgets_agent",
            data: { error: "fallo" },
          },
        },
        { event: "messages/partial", data: [{ type: "ai", content: "Retomado." }] },
      ]),
      send,
    );
    const tipos = send.mock.calls.map((c) => c[0].type);
    expect(tipos).toEqual(["tool_start", "tool_error", "token", "done"]);
  });

  it("no suprime tokens de herramientas normales (sin sufijo _agent)", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await buildSSEStream(
      makeStream([
        {
          event: "events",
          data: {
            event: "on_tool_start",
            run_id: "t-1",
            name: "get_transactions",
            data: { input: {} },
          },
        },
        { event: "messages/partial", data: [{ type: "ai", content: "Visible" }] },
        {
          event: "events",
          data: {
            event: "on_tool_end",
            run_id: "t-1",
            name: "get_transactions",
            data: { output: [] },
          },
        },
      ]),
      send,
    );
    expect(send).toHaveBeenCalledWith({ type: "token", content: "Visible" });
  });
});
