import { cookies } from "next/headers";
import { COOKIE_USER_INFO } from "@/shared/constants/auth";
import type { UserInfo } from "@/types/auth";

/**
 * Reads the user_info cookie and returns the userId as a string.
 * Returns null if the cookie is missing or malformed.
 */
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
