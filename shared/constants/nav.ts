import { LayoutGrid, Receipt, Wallet, Flag, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Curator", icon: LayoutGrid },
  { href: "/transactions", label: "Transacciones", icon: Receipt },
  { href: "/budgets", label: "Presupuestos", icon: Wallet },
  { href: "/goals", label: "Metas", icon: Flag },
];

/** Estilo unificado del ítem activo en el sidebar (sin borde lateral ni doble tinte). */
export function sidebarNavLinkClasses(isActive: boolean) {
  return cn(
    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200",
    isActive
      ? "bg-accent text-foreground font-semibold ring-1 ring-inset ring-primary/25"
      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
  );
}

export function sidebarNavIconClasses(isActive: boolean) {
  return cn(
    "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
  );
}
