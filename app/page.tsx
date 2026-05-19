import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";
import {
  PlusCircle,
  LayoutGrid,
  Receipt,
  Wallet,
  Flag,
  User,
  Sparkles,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ThreadList } from "@/components/chat/ThreadList";
import { DashboardWidgets } from "@/components/features/dashboard/DashboardWidgets";
import { WidgetsSkeleton } from "@/components/features/dashboard/WidgetsSkeleton";
import { COOKIE_USER_INFO } from "@/shared/constants/auth";
import type { UserInfo } from "@/types/auth";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid, active: true },
  { href: "/transactions", label: "Transacciones", icon: Receipt, active: false },
  { href: "/budgets", label: "Presupuestos", icon: Wallet, active: false },
  { href: "/goals", label: "Metas", icon: Flag, active: false },
];

interface PageProps {
  searchParams: Promise<{ thread?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const userInfoRaw = cookieStore.get(COOKIE_USER_INFO)?.value;
  let userInfo: UserInfo | null = null;
  if (userInfoRaw) {
    try {
      userInfo = JSON.parse(decodeURIComponent(userInfoRaw)) as UserInfo;
    } catch {
      // ignore
    }
  }
  const userName = userInfo?.name;

  const { thread: threadParam } = await searchParams;
  const initialThreadId = threadParam ?? undefined;

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden text-on-surface bg-background">
        <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 left-0 bg-surface-container-low border-r border-outline-variant/20">
          <div className="flex flex-col h-full px-4 py-6">
            <div className="px-3 mb-8">
              <p className="text-xl font-bold tracking-tight text-on-surface font-headline">
                FinanzIA
              </p>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60 mt-0.5">
                Intelligent Curator
              </p>
            </div>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary px-4 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95 mb-6"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva conversación</span>
            </Link>

            <nav className="space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>

            <ThreadList activeThreadId={initialThreadId} />

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

        <main className="flex-grow flex flex-col relative overflow-hidden chat-gradient">
          <header className="w-full h-16 sticky top-0 z-40 bg-white/50 backdrop-blur-xl flex items-center justify-between px-8 border-b border-white/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-base font-bold text-on-surface font-headline leading-tight">
                  FinanzIA Agent
                </p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">
                  Listo para ayudarte
                </p>
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
            <div className="max-h-52 flex-shrink-0 overflow-y-auto border-b border-outline-variant/20 bg-white/50 p-4 lg:hidden">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Resumen del mes
              </p>
              <Suspense fallback={<WidgetsSkeleton />}>
                <DashboardWidgets />
              </Suspense>
            </div>

            <aside className="hidden w-80 flex-shrink-0 overflow-y-auto border-r border-outline-variant/20 bg-white/40 p-5 lg:block">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Resumen del mes
              </p>
              <Suspense fallback={<WidgetsSkeleton />}>
                <DashboardWidgets />
              </Suspense>
            </aside>

            <div className="min-w-0 flex-1">
              <ChatInterface
                key={initialThreadId ?? "new"}
                userName={userName}
                initialThreadId={initialThreadId}
              />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
