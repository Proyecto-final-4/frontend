import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

function getColorClass(percent: number): string {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 70) return "bg-amber-400";
  return "bg-primary";
}

function Progress({ value, max = 100, label, showPercent = false, className }: ProgressProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);
  const colorClass = getColorClass(percent);

  return (
    <div data-slot="progress" className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showPercent && (
            <span className="text-xs font-semibold text-foreground">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="w-full h-1.5 rounded-full bg-muted overflow-hidden"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export { Progress };
