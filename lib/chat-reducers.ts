import type { AssistantPart, ToolCallPart } from "@/types/chat";

/** Returns the initial parts array for a new streaming assistant message. */
export function emptyAssistantParts(): AssistantPart[] {
  return [{ kind: "text", content: "" }];
}

/**
 * Applies a cumulative text token to the parts array.
 * Finds the last text part and replaces its content.
 * If no text part exists, prepends a new one.
 */
export function applyToken(parts: AssistantPart[], content: string): AssistantPart[] {
  const lastTextIdx = [...parts].map((p, i) => (p.kind === "text" ? i : -1)).filter((i) => i >= 0);
  if (lastTextIdx.length === 0) return [{ kind: "text", content }, ...parts];
  const idx = lastTextIdx[lastTextIdx.length - 1];
  const next = [...parts];
  next[idx] = { kind: "text", content };
  return next;
}

/**
 * Updates a tool_call part identified by `toolCallId` with the given patch.
 * Parts that do not match are returned unchanged.
 */
export function applyToolUpdate(
  parts: AssistantPart[],
  toolCallId: string,
  patch: Partial<ToolCallPart>,
): AssistantPart[] {
  return parts.map((p) =>
    p.kind === "tool_call" && p.toolCallId === toolCallId ? { ...p, ...patch } : p,
  );
}
