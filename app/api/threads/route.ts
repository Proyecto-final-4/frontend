import { cookies } from "next/headers";
import { Client } from "@langchain/langgraph-sdk";
import { COOKIE_TOKEN } from "@/shared/constants/auth";
import { getUserIdFromCookie } from "@/lib/auth-server";

const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL ?? "http://localhost:2024";
const LANGCHAIN_API_KEY = process.env.LANGCHAIN_API_KEY;

function makeClient() {
  return new Client({ apiUrl: LANGGRAPH_API_URL, apiKey: LANGCHAIN_API_KEY });
}

/** GET /api/threads — list threads for the authenticated user, newest first */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const userId = await getUserIdFromCookie();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const client = makeClient();

  try {
    const threads = await client.threads.search({
      metadata: { userId },
      limit: 100,
    });

    const sorted = [...threads].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return Response.json(sorted);
  } catch (err) {
    console.error("[GET /api/threads] url:", LANGGRAPH_API_URL, "error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

/** POST /api/threads — create a new thread for the authenticated user */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const userId = await getUserIdFromCookie();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { title?: string };
  const title = body.title ?? "Nueva conversación";

  const client = makeClient();

  try {
    const thread = await client.threads.create({
      metadata: { userId, title },
    });
    return Response.json(thread);
  } catch (err) {
    console.error("[POST /api/threads] url:", LANGGRAPH_API_URL, "error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
