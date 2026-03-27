"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { COOKIE_USER_INFO } from "@/shared/constants/auth";

/**
 * Lee la cookie user_info en el cliente.
 * En SSR devuelve true porque el middleware ya validó el token en el servidor;
 * esta verificación sólo corre en el navegador.
 */
function hasSession(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie.split("; ").some((row) => row.startsWith(`${COOKIE_USER_INFO}=`));
}

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Guard de autenticación del lado del cliente.
 *
 * Propósito: segunda línea de defensa tras el middleware.
 * Cubre casos que el middleware no puede interceptar:
 *   – Navegación SPA (Next.js router) sin petición al servidor
 *   – Expiración de cookie mientras la pestaña está abierta
 *   – Eliminación manual de cookies desde DevTools
 *
 * En caso de no detectar sesión activa redirige a /login sin flash
 * visible porque el servidor ya habría redirigido antes de renderizar.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const verified = useRef(false);

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    if (!hasSession()) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
