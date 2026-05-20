import { AnimateIn } from "@/components/ui/animate-in";

export function AuthVisual() {
  return (
    <div className="relative z-10 hidden min-h-screen md:flex md:w-[55%] lg:w-[60%] items-center justify-center p-12 lg:p-24 text-foreground pointer-events-none">
      <AnimateIn variant="fade-up" className="max-w-lg">
        <h2 className="font-headline text-6xl lg:text-8xl font-extrabold mb-6 tracking-tight gradient-text">
          Bienvenido.
        </h2>
        <div className="space-y-6">
          <p className="text-xl lg:text-2xl font-light leading-relaxed text-muted-foreground">
            Potencia conversacional de <span className="font-bold text-primary">FinanzIA</span>. Tu
            curador inteligente de finanzas personales.
          </p>
        </div>
      </AnimateIn>
    </div>
  );
}
