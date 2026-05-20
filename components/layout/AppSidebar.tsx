import Link from "next/link";
import { cookies } from "next/headers";
import { PlusCircle } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThreadList } from "@/components/chat/ThreadList";
import { Avatar } from "@/components/ui/avatar";
import { NAV_LINKS, sidebarNavIconClasses, sidebarNavLinkClasses } from "@/shared/constants/nav";
import { COOKIE_USER_INFO } from "@/shared/constants/auth";
import type { UserInfo } from "@/types/auth";

interface AppSidebarProps {
  activeHref: string;
  activeThreadId?: string;
}

export async function AppSidebar({ activeHref, activeThreadId }: AppSidebarProps) {
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
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 left-0 bg-sidebar border-r border-sidebar-border">
      <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
        <div className="mb-8 shrink-0 px-3">
          <p className="text-xl font-bold tracking-tight text-foreground font-headline">FinanzIA</p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
            Intelligent Curator
          </p>
        </div>

        <Link
          href="/"
          className="mb-6 flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:shadow-[0_0_16px_rgba(127,228,75,0.3)] hover:brightness-110 active:scale-[0.97]"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nueva conversación</span>
        </Link>

        <nav className="shrink-0 space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = href === activeHref;
            return (
              <Link key={href} href={href} className={sidebarNavLinkClasses(isActive)}>
                <Icon className={sidebarNavIconClasses(isActive)} />
                {label}
              </Link>
            );
          })}
        </nav>

        <ThreadList activeThreadId={activeThreadId} />

        <div className="mt-4 flex shrink-0 items-center gap-3 border-t border-border px-2 pt-4">
          <Avatar name={userName ?? "Usuario"} size="md" />
          <div className="min-w-0 flex-grow">
            <p className="truncate text-sm font-bold leading-tight text-foreground">
              {userName ?? "Usuario"}
            </p>
            <p className="text-[10px] uppercase leading-tight tracking-wider text-muted-foreground">
              Premium
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
