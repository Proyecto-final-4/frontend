import { cookies } from "next/headers";
import { Client } from "@langchain/langgraph-sdk";
import { COOKIE_TOKEN } from "@/shared/constants/auth";
import { getUserIdFromCookie } from "@/lib/auth-server";

const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL ?? "http://localhost:2024";

interface LangGraphMessage {
  id?: string;
  type: string;
  content: string | Array<{ type: string; text?: string }>;
}

/** GET /api/threads/[id]/history — returns the conversation messages for a thread */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const userId = await getUserIdFromCookie();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const client = new Client({ apiUrl: LANGGRAPH_API_URL });

  try {
    // Verify ownership
    const thread = await client.threads.get(id);
    const meta = thread.metadata as Record<string, unknown> | null;
    if (!meta || String(meta.userId) !== userId) {
      return new Response("Forbidden", { status: 403 });
    }

    // Get the current checkpoint state which holds all messages
    const state = await client.threads.getState(id);
    const rawMessages = ((state.values as Record<string, unknown> | null)?.messages ??
      []) as LangGraphMessage[];

    // Map to the shape ChatInterface expects
    const messages = rawMessages
      .filter((m) => m.type === "human" || m.type === "ai")
      .map((m, i) => {
        const text =
          typeof m.content === "string"
            ? m.content
            : m.content
                .filter((c) => c.type === "text" && typeof c.text === "string")
                .map((c) => c.text)
                .join("");
        if (m.type === "human") {
          return { id: m.id ?? `msg-${i}`, role: "user" as const, content: text };
        }
        return {
          id: m.id ?? `msg-${i}`,
          role: "assistant" as const,
          parts: [{ kind: "text" as const, content: text }],
        };
      })
      .filter((m) =>
        m.role === "user" ? m.content.trim() !== "" : m.parts[0].content.trim() !== "",
      );

    return Response.json(messages);
  } catch (err) {
    console.error("[GET /api/threads/:id/history] error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
