import { cookies } from "next/headers";
import { Client } from "@langchain/langgraph-sdk";
import { COOKIE_TOKEN, COOKIE_USER_INFO } from "@/shared/constants/auth";
import type { UserInfo } from "@/types/auth";
import { validateDocumentFiles } from "@/lib/document-attachments";
import { buildSSEStream } from "../_stream-helpers";

const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL ?? "http://localhost:2024";
const ASSISTANT_ID = process.env.LANGGRAPH_ASSISTANT_ID ?? "financial_agent";

interface SerializedAttachment {
  filename: string;
  mimeType: string;
  size: number;
  base64: string;
}

async function parseChatRequest(request: Request): Promise<{
  message: string;
  threadId?: string | null;
  attachments: SerializedAttachment[];
}> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const message = String(formData.get("message") ?? "").trim();
    const rawThreadId = formData.get("threadId");
    const threadId = typeof rawThreadId === "string" && rawThreadId ? rawThreadId : null;
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);

    const validationError = validateDocumentFiles(
      files.map((file) => ({ name: file.name, type: file.type, size: file.size })),
    );
    if (validationError) throw new Response(validationError, { status: 400 });

    const attachments = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
      })),
    );

    return { message, threadId, attachments };
  }

  const { message, threadId } = (await request.json()) as {
    message: string;
    threadId?: string | null;
  };

  return { message: message.trim(), threadId, attachments: [] };
}

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
      // ignore invalid optional profile cookie
    }
  }

  let parsedRequest: Awaited<ReturnType<typeof parseChatRequest>>;
  try {
    parsedRequest = await parseChatRequest(request);
  } catch (err) {
    if (err instanceof Response) return err;
    return new Response("Invalid request body", { status: 400 });
  }

  const { message, threadId: existingThreadId, attachments } = parsedRequest;
  if (!message && attachments.length === 0) {
    return new Response("message or files are required", { status: 400 });
  }

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
        const titleSource = message || attachments[0]?.filename || "Documento adjunto";
        const title =
          titleSource.length > 40 ? `${titleSource.slice(0, 40).trimEnd()}...` : titleSource;
        const userId = userInfo?.id != null ? String(userInfo.id) : undefined;
        const thread = await client.threads.create({
          metadata: { ...(userId ? { userId } : {}), title },
        });
        threadId = thread.thread_id;
      }
      await send({ type: "thread", id: threadId });

      const runStream = client.runs.stream(threadId, ASSISTANT_ID, {
        input: {
          messages:
            attachments.length > 0
              ? []
              : [
                  {
                    role: "user",
                    content: message,
                  },
                ],
          token,
        },
        config: {
          configurable: {
            token,
            userName,
            documentMessage: attachments.length > 0 ? message : undefined,
            documentAttachments: attachments.length > 0 ? attachments : undefined,
          },
        },
        streamMode: ["messages", "events", "updates"],
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
