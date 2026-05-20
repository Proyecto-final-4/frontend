import { cookies } from "next/headers";
import { Sparkles } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { SidebarDrawer } from "@/components/layout/SidebarDrawer";
import { MenuButton } from "@/components/layout/MenuButton";
import { COOKIE_USER_INFO } from "@/shared/constants/auth";
import type { UserInfo } from "@/types/auth";

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
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden text-foreground bg-background">
          <SidebarDrawer>
            <AppSidebar activeHref="/" activeThreadId={initialThreadId} />
          </SidebarDrawer>

          <main className="relative flex min-w-0 flex-grow flex-col overflow-hidden chat-gradient">
            <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-8">
              <MenuButton />
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-base font-bold leading-tight text-foreground font-headline">
                    FinanzIA Agent
                  </p>
                  <p className="text-[10px] font-bold uppercase leading-none tracking-widest text-primary">
                    Listo para ayudarte
                  </p>
                </div>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ChatInterface
                key={initialThreadId ?? "new"}
                userName={userName}
                initialThreadId={initialThreadId}
              />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
