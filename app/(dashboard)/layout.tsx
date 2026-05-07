import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_USER_INFO } from "@/shared/constants/auth";
import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * Layout for protected dashboard routes (/transactions, /budgets, etc.).
 *
 * Protection layers:
 *   1. Middleware  → redirects before rendering (no token in httpOnly cookie)
 *   2. This layout → redirects on the server if user_info cookie is missing
 *   3. AuthGuard   → redirects on the client if the session expires with the tab open
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_USER_INFO);

  if (!session?.value) {
    redirect("/login");
  }

  return <AuthGuard>{children}</AuthGuard>;
}
