import { cn } from "@/lib/utils";

/** Shared `<select>` style for dashboard forms. */
export const formSelectClassName = cn(
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs",
  "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
);
