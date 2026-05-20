"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

export function SidebarDrawer({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Sidebar wrapper: drawer on mobile, static on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-[110] transition-transform duration-300 md:static md:z-auto md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {children}
      </div>
    </>
  );
}
