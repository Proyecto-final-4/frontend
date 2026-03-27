import Link from "next/link";
import {
  PlusCircle,
  LayoutGrid,
  Receipt,
  Wallet,
  Flag,
  User,
  Sparkles,
  BarChart2,
  PlusCircle as AttachIcon,
  ArrowUp,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LogoutButton } from "@/components/auth/LogoutButton";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid, active: true },
  { href: "/transactions", label: "Transacciones", icon: Receipt, active: false },
  { href: "/budgets", label: "Presupuestos", icon: Wallet, active: false },
  { href: "/goals", label: "Metas", icon: Flag, active: false },
];

const PROMPT_CHIPS = ["Verificar patrimonio", "Top gastos del mes", "Predicciones de ahorro"];

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden text-on-surface bg-background">
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 left-0 bg-surface-container-low border-r border-outline-variant/20">
          <div className="flex flex-col h-full px-4 py-6">
            {/* Brand */}
            <div className="px-3 mb-8">
              <p className="text-xl font-bold tracking-tight text-on-surface font-headline">
                FinanzIA
              </p>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60 mt-0.5">
                Intelligent Curator
              </p>
            </div>

            {/* New Chat CTA */}
            <button className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary px-4 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95 mb-6">
              <PlusCircle className="w-4 h-4" />
              <span>Nueva conversación</span>
            </button>

            {/* Nav Links */}
            <nav className="flex-grow space-y-1">
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

            {/* User Profile */}
            <div className="pt-4 flex items-center gap-3 px-2 border-t border-outline-variant/20">
              <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-on-secondary-container" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-on-surface truncate leading-tight">Fabian</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider leading-tight">
                  Premium
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────── */}
        <main className="flex-grow flex flex-col relative overflow-hidden chat-gradient">
          {/* Top Bar */}
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
            <button className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/40 text-on-surface px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-container transition-colors">
              <BarChart2 className="w-4 h-4" />
              Ver reportes
            </button>
          </header>

          {/* Empty state — saludo inicial */}
          <section className="flex-grow flex flex-col items-center justify-center px-6 pb-40">
            <div className="text-center max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-3">
                Hola, Fabian
              </h1>
              <p className="text-secondary text-base font-medium leading-relaxed">
                ¿Qué te gustaría hacer hoy?
              </p>
            </div>
          </section>

          {/* Command Input Bar */}
          <div className="absolute bottom-0 left-0 w-full px-6 pb-6 pt-10 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
            <div className="max-w-2xl mx-auto w-full pointer-events-auto">
              {/* Prompt Chips */}
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-0.5">
                {PROMPT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    className="bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border border-outline-variant/30 flex-shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-lg px-2 py-2 gap-2">
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl hover:bg-surface-container">
                  <AttachIcon className="w-5 h-5" />
                </button>
                <input
                  className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 font-medium text-sm outline-none py-1.5"
                  placeholder="Pregunta cualquier cosa sobre tus finanzas..."
                  type="text"
                />
                <button className="bg-primary text-on-primary w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-90 active:scale-95 flex-shrink-0">
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>

              <p className="text-center mt-3 text-[9px] text-on-surface-variant/30 font-bold uppercase tracking-[0.25em]">
                FinanzIA Intelligence Curator • 2026
              </p>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
