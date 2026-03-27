import { ShieldCheck } from "lucide-react";

export function AuthVisual() {
  return (
    <div className="hidden md:flex md:w-[55%] lg:w-[60%] fluid-bg relative overflow-hidden items-center justify-center p-12 lg:p-24 text-white">
      {/* Abstract shape overlay */}
      <div className="absolute inset-0 opacity-40">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M0,0 C30,20 70,10 100,0 L100,100 C70,90 30,80 0,100 Z"
            fill="rgba(255,255,255,0.05)"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-lg">
        <h2 className="font-headline text-6xl lg:text-8xl font-extrabold mb-6 tracking-tight">
          Welcome.
        </h2>
        <div className="space-y-6">
          <p className="text-xl lg:text-2xl font-light leading-relaxed opacity-90">
            Experience the conversational AI power of{" "}
            <span className="font-bold">FinanzIA</span>. Your intelligent curator for wealth
            and wisdom.
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container-high" />
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container" />
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-dim" />
            </div>
            <span className="text-sm font-semibold tracking-wide opacity-75">
              Joined by 10k+ curators today
            </span>
          </div>
        </div>
      </div>

      {/* Glass card */}
      <div className="absolute bottom-12 right-12 glass-effect p-4 rounded-xl max-w-xs">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="text-primary-fixed w-5 h-5 shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">
            End-to-end encrypted <br /> conversational financial intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
