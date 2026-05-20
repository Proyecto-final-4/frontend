import type { AssistantPart, ToolCallPart } from "@/types/chat";

/** Returns the initial parts array for a new streaming assistant message. */
export function emptyAssistantParts(): AssistantPart[] {
  return [{ kind: "text", content: "" }];
}

/**
 * Applies a cumulative text token to the parts array.
 * Finds the last text part and replaces its content.
 * If no text part exists, prepends a new one.
 *
 * O(1) best-case: reverse scan with early exit.
 * Avoids three intermediate arrays from the previous pattern (spread + map + filter).
 * In practice the text part sits at index 0 and tool_call parts accumulate
 * at the end, so the search walks at most N-1 tool_call parts.
 */
export function applyToken(parts: AssistantPart[], content: string): AssistantPart[] {
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].kind === "text") {
      const next = [...parts];
      next[i] = { kind: "text", content };
      return next;
    }
  }
  return [{ kind: "text", content }, ...parts];
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
