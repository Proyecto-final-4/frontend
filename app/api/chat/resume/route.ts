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
  if (!token) return new Response("Unauthorized", { status: 401 });

  const userInfoRaw = cookieStore.get(COOKIE_USER_INFO)?.value;
  let userName: string | undefined;
  if (userInfoRaw) {
    try {
      const userInfo = JSON.parse(decodeURIComponent(userInfoRaw)) as UserInfo;
      userName = userInfo.name;
    } catch {
      // ignore
    }
  }

  const { threadId, value } = (await request.json()) as {
    threadId: string;
    value: unknown;
  };

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  (async () => {
    const client = new Client({ apiUrl: LANGGRAPH_API_URL });
    try {
      // Notify client of the thread being continued
      const encoder = new TextEncoder();
      const send = async (data: Record<string, unknown>) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      await send({ type: "thread", id: threadId });

      const runStream = client.runs.stream(threadId, ASSISTANT_ID, {
        command: { resume: value },
        config: { configurable: { token, userName } },
        streamMode: ["messages", "tools", "tasks"],
      });

      await buildSSEStream(runStream, send);
    } catch (err) {
      const encoder = new TextEncoder();
      const send = async (data: Record<string, unknown>) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      console.error("[chat/resume] error:", err);
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
