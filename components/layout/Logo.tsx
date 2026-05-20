import { Wallet } from "lucide-react";
import { AnimateIn } from "@/components/ui/animate-in";

export function Logo() {
  return (
    <AnimateIn variant="fade-up">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-sm">
          <Wallet className="text-primary-foreground w-5 h-5" />
        </div>
        <div>
          <h1 className="font-headline text-xl font-extrabold tracking-tight gradient-text leading-none">
            FinanzIA
          </h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">
            Intelligent Curator
          </p>
        </div>
      </div>
    </AnimateIn>
  );
}
