import { cookies } from "next/headers";
import { COOKIE_TOKEN, COOKIE_USER_INFO } from "@/shared/constants/auth";
import type { UserInfo } from "@/types/auth";

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_TOKEN)?.value ?? null;
}

export async function getUserIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_USER_INFO)?.value;
  if (!raw) return null;
  try {
    const info = JSON.parse(decodeURIComponent(raw)) as UserInfo;
    return String(info.id);
  } catch {
    return null;
  }
}
