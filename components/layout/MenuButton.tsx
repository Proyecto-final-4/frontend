"use client";
import { Menu, X } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export function MenuButton() {
  const { isOpen, toggle } = useSidebar();
  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}
