import { LayoutGrid, Receipt, Wallet, Flag, type LucideIcon } from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/transactions", label: "Transacciones", icon: Receipt },
  { href: "/budgets", label: "Presupuestos", icon: Wallet },
  { href: "/goals", label: "Metas", icon: Flag },
];
