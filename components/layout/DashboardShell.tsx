import Link from "next/link";
import { cookies } from "next/headers";
import { PlusCircle, User } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NAV_LINKS } from "@/shared/constants/nav";
import { COOKIE_USER_INFO } from "@/shared/constants/auth";
import type { UserInfo } from "@/types/auth";
import { cn } from "@/lib/utils";

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
  const cookieStore = await cookies();
  const userInfoRaw = cookieStore.get(COOKIE_USER_INFO)?.value;
  let userName: string | undefined;
  if (userInfoRaw) {
    try {
      userName = (JSON.parse(decodeURIComponent(userInfoRaw)) as UserInfo).name;
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-background">
      <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 left-0 bg-surface-container-low border-r border-outline-variant/20">
        <div className="flex flex-col h-full px-4 py-6">
          <div className="px-3 mb-8">
            <p className="text-xl font-bold tracking-tight text-on-surface font-headline">FinanzIA</p>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60 mt-0.5">
              Intelligent Curator
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary px-4 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95 mb-6"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva conversaciÃ³n</span>
          </Link>
          <nav className="space-y-1 flex-grow">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors duration-200",
                  href === activeHref
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                )}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 flex items-center gap-3 px-2 border-t border-outline-variant/20">
            <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-on-secondary-container" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-on-surface truncate leading-tight">
                {userName ?? "Usuario"}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider leading-tight">
                Premium
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>
      <main className="flex-grow flex flex-col overflow-hidden">
        <header className="w-full h-16 sticky top-0 z-40 bg-white/50 backdrop-blur-xl flex items-center px-8 border-b border-outline-variant/20">
          <div>
            <p className="text-base font-bold text-on-surface font-headline leading-tight">{title}</p>
            {subtitle ? (
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mt-0.5">
                {subtitle}
              </p>
            ) : null}
          </div>
        </header>
        <div className="flex-grow overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}
