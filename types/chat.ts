// ── Per-part types inside an assistant message ───────────────────────────────

export interface TextPart {
  kind: "text";
  /** Cumulative text content (each token event replaces this). */
  content: string;
}

export interface ToolCallPart {
  kind: "tool_call";
  toolCallId: string;
  name: string;
  input?: unknown;
  status: "running" | "done" | "error";
  result?: unknown;
  error?: unknown;
}

export type AssistantPart = TextPart | ToolCallPart;

// ── Top-level message types ──────────────────────────────────────────────────

export interface UserMessage {
  id: string;
  role: "user";
  content: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
  }>;
}

export interface AssistantMessage {
  id: string;
  role: "assistant";
  parts: AssistantPart[];
}

/**
 * A HITL / graph interrupt that requires user input before the run can resume.
 */
export interface InterruptMessage {
  id: string;
  role: "interrupt";
  /** Opaque ID from LangGraph — needed to resume the correct interrupt. */
  interruptId?: string;
  /** The value the agent passed to interrupt(). Can be a string or any object. */
  value: unknown;
  /** True once the user has responded (so we don't show the form again). */
  resolved?: boolean;
}

export type ChatMessage = UserMessage | AssistantMessage | InterruptMessage;
