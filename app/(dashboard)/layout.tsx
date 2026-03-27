import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_USER_INFO } from "@/shared/constants/auth";
import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * Layout de las rutas protegidas del dashboard (/transactions, /budgets, etc.).
 *
 * Capas de protección:
 *   1. Middleware  → redirige antes de renderizar (sin token en cookie httpOnly)
 *   2. Este layout → redirige en el servidor si falta user_info (cookie de sesión)
 *   3. AuthGuard   → redirige en el cliente si la sesión expira con la pestaña abierta
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_USER_INFO);

  if (!session?.value) {
    redirect("/login");
  }

  return <AuthGuard>{children}</AuthGuard>;
}
