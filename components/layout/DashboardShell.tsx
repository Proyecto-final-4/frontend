import { AppSidebar } from "@/components/layout/AppSidebar";
import { AnimatedMain } from "@/components/layout/AnimatedMain";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { SidebarDrawer } from "@/components/layout/SidebarDrawer";
import { MenuButton } from "@/components/layout/MenuButton";

interface DashboardShellProps {
  children: React.ReactNode;
  activeHref: string;
  title: string;
  subtitle?: string;
}

export async function DashboardShell({
  children,
  activeHref,
  title,
  subtitle,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden text-foreground bg-background">
        <SidebarDrawer>
          <AppSidebar activeHref={activeHref} />
        </SidebarDrawer>
        <main className="flex min-w-0 flex-grow flex-col overflow-hidden">
          <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-8">
            <MenuButton />
            <div>
              <p className="text-base font-bold text-foreground font-headline leading-tight">
                {title}
              </p>
              {subtitle ? (
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mt-0.5">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </header>
          <AnimatedMain className="flex-grow overflow-y-auto p-4 md:p-8">{children}</AnimatedMain>
        </main>
      </div>
    </SidebarProvider>
  );
}
