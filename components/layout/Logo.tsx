import { Wallet } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-sm">
        <Wallet className="text-white w-5 h-5" />
      </div>
      <div>
        <h1 className="font-headline text-xl font-extrabold tracking-tight text-primary leading-none">
          FinanzIA
        </h1>
        <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mt-1">
          Intelligent Curator
        </p>
      </div>
    </div>
  );
}
