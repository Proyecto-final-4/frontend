import { cookies } from "next/headers";
import { COOKIE_TOKEN } from "@/shared/constants/auth";

export async function getServerToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;
  if (!token) throw new Error("No autenticado");
  return token;
}
