import { describe, it, expect } from "vitest";
import { emptyAssistantParts, applyToken, applyToolUpdate } from "@/lib/chat-reducers";
import type { AssistantPart, TextPart } from "@/types/chat";

describe("emptyAssistantParts", () => {
  it("returns a single empty text part", () => {
    const parts = emptyAssistantParts();
    expect(parts).toHaveLength(1);
    expect(parts[0]).toEqual({ kind: "text", content: "" });
  });

  it("returns a new array each call", () => {
    expect(emptyAssistantParts()).not.toBe(emptyAssistantParts());
  });
});

describe("applyToken", () => {
  it("replaces content of the last text part", () => {
    const parts = emptyAssistantParts();
    const next = applyToken(parts, "Hello");
    expect(next[0]).toEqual({ kind: "text", content: "Hello" });
  });

  it("cumulative update replaces previous content", () => {
    const parts = emptyAssistantParts();
    const step1 = applyToken(parts, "Hi");
    const step2 = applyToken(step1, "Hi there");
    expect(step2[0]).toEqual({ kind: "text", content: "Hi there" });
    expect(step2).toHaveLength(1);
  });

  it("does not mutate the original array", () => {
    const parts = emptyAssistantParts();
    applyToken(parts, "new content");
    expect((parts[0] as TextPart).content).toBe("");
  });

  it("updates the LAST text part when multiple text parts exist", () => {
    const parts: AssistantPart[] = [
      { kind: "text", content: "first" },
      { kind: "tool_call", toolCallId: "c1", name: "get_transactions", status: "done" },
      { kind: "text", content: "" },
    ];
    const next = applyToken(parts, "second paragraph");
    expect(next[0]).toEqual({ kind: "text", content: "first" });
    expect(next[2]).toEqual({ kind: "text", content: "second paragraph" });
  });

  it("prepends a new text part when none exists", () => {
    const parts: AssistantPart[] = [
      { kind: "tool_call", toolCallId: "c1", name: "get_transactions", status: "running" },
    ];
    const next = applyToken(parts, "result");
    expect(next[0]).toEqual({ kind: "text", content: "result" });
    expect(next[1].kind).toBe("tool_call");
  });
});

describe("applyToolUpdate", () => {
  const baseParts: AssistantPart[] = [
    { kind: "text", content: "Checking..." },
    { kind: "tool_call", toolCallId: "call-1", name: "get_transactions", status: "running" },
    { kind: "text", content: "" },
  ];

  it("updates status to done for matching toolCallId", () => {
    const next = applyToolUpdate(baseParts, "call-1", { status: "done", result: [] });
    const tool = next[1];
    if (tool.kind !== "tool_call") throw new Error("expected tool_call");
    expect(tool.status).toBe("done");
    expect(tool.result).toEqual([]);
  });

  it("updates status to error with error field", () => {
    const next = applyToolUpdate(baseParts, "call-1", { status: "error", error: "timeout" });
    const tool = next[1];
    if (tool.kind !== "tool_call") throw new Error("expected tool_call");
    expect(tool.status).toBe("error");
    expect(tool.error).toBe("timeout");
  });

  it("does not mutate the original array", () => {
    applyToolUpdate(baseParts, "call-1", { status: "done" });
    const tool = baseParts[1];
    if (tool.kind !== "tool_call") throw new Error("expected tool_call");
    expect(tool.status).toBe("running");
  });

  it("leaves non-matching parts unchanged", () => {
    const parts: AssistantPart[] = [
      { kind: "tool_call", toolCallId: "call-A", name: "get_categories", status: "running" },
      { kind: "tool_call", toolCallId: "call-B", name: "get_transactions", status: "running" },
    ];
    const next = applyToolUpdate(parts, "call-A", { status: "done" });
    const toolA = next[0];
    const toolB = next[1];
    if (toolA.kind !== "tool_call" || toolB.kind !== "tool_call")
      throw new Error("expected tool_call");
    expect(toolA.status).toBe("done");
    expect(toolB.status).toBe("running");
  });

  it("returns same array length regardless of match", () => {
    const next = applyToolUpdate(baseParts, "non-existent", { status: "done" });
    expect(next).toHaveLength(baseParts.length);
  });
});
