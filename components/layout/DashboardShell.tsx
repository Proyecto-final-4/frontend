import { AppSidebar } from "@/components/layout/AppSidebar";
import { AnimatedMain } from "@/components/layout/AnimatedMain";

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
    <div className="flex h-screen overflow-hidden text-foreground bg-background">
      <AppSidebar activeHref={activeHref} />
      <main className="flex-grow flex flex-col overflow-hidden">
        <header className="w-full h-16 sticky top-0 z-40 bg-background/80 backdrop-blur-xl flex items-center px-8 border-b border-border">
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
        <AnimatedMain className="flex-grow overflow-y-auto p-8">{children}</AnimatedMain>
      </main>
    </div>
  );
}
