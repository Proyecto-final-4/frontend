import { cookies } from "next/headers";
import { Client } from "@langchain/langgraph-sdk";
import { COOKIE_TOKEN } from "@/shared/constants/auth";
import { getUserIdFromCookie } from "@/lib/auth-server";

const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL ?? "http://localhost:2024";

async function getThreadAndVerifyOwner(threadId: string, userId: string) {
  const client = new Client({ apiUrl: LANGGRAPH_API_URL });
  const thread = await client.threads.get(threadId);
  const meta = thread.metadata as Record<string, unknown> | null;
  if (!meta || String(meta.userId) !== userId) return null;
  return { client, thread };
}

/** DELETE /api/threads/[id] — delete a thread owned by the current user */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const userId = await getUserIdFromCookie();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  try {
    const result = await getThreadAndVerifyOwner(id, userId);
    if (!result) return new Response("Forbidden", { status: 403 });

    await result.client.threads.delete(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/threads/:id] error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

/** PATCH /api/threads/[id] — rename a thread owned by the current user */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const userId = await getUserIdFromCookie();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { title?: string };
  if (!body.title) return new Response("title is required", { status: 400 });

  try {
    const result = await getThreadAndVerifyOwner(id, userId);
    if (!result) return new Response("Forbidden", { status: 403 });

    const updated = await result.client.threads.update(id, {
      metadata: { userId, title: body.title },
    });
    return Response.json(updated);
  } catch (err) {
    console.error("[PATCH /api/threads/:id] error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
