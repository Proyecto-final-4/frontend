import { cookies } from "next/headers";
import { Client } from "@langchain/langgraph-sdk";
import { COOKIE_TOKEN, COOKIE_USER_INFO } from "@/shared/constants/auth";
import type { UserInfo } from "@/types/auth";
import { buildSSEStream } from "../_stream-helpers";

const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL ?? "http://localhost:2024";
const ASSISTANT_ID = process.env.LANGGRAPH_ASSISTANT_ID ?? "financial_agent";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userInfoRaw = cookieStore.get(COOKIE_USER_INFO)?.value;
  let userInfo: UserInfo | undefined;
  let userName: string | undefined;
  if (userInfoRaw) {
    try {
      userInfo = JSON.parse(decodeURIComponent(userInfoRaw)) as UserInfo;
      userName = userInfo.name;
    } catch {
      // ignore
    }
  }

  const { message, threadId: existingThreadId } = (await request.json()) as {
    message: string;
    threadId?: string | null;
  };

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  const send = async (data: Record<string, unknown>) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  (async () => {
    const client = new Client({ apiUrl: LANGGRAPH_API_URL });

    try {
      let threadId = existingThreadId ?? undefined;
      if (!threadId) {
        const title = message.length > 40 ? `${message.slice(0, 40).trimEnd()}…` : message;
        const userId = userInfo?.id != null ? String(userInfo.id) : undefined;
        const thread = await client.threads.create({
          metadata: { ...(userId ? { userId } : {}), title },
        });
        threadId = thread.thread_id;
      }
      await send({ type: "thread", id: threadId });

      const runStream = client.runs.stream(threadId, ASSISTANT_ID, {
        input: {
          messages: [{ role: "user", content: message }],
          token,
        },
        config: {
          configurable: { token, userName },
        },
        streamMode: ["messages", "tools", "tasks"],
      });

      await buildSSEStream(runStream, send);
    } catch (err) {
      console.error("[chat/stream] error:", err);
      await send({ type: "error", message: (err as Error).message });
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
