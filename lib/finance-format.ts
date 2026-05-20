export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`;
}
export function formatDelta(amount: number): string {
  return `${amount > 0 ? "+" : ""}${formatCurrency(amount)}`;
}
export type SavingsRateTone = "positive" | "neutral" | "negative";
export function savingsRateTone(rate: number | null): SavingsRateTone {
  if (rate === null || Number.isNaN(rate)) return "neutral";
  if (rate > 20) return "positive";
  if (rate >= 10) return "neutral";
  return "negative";
}
export const SAVINGS_RATE_TONE_CLASS: Record<SavingsRateTone, string> = {
  positive: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  neutral: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  negative: "text-red-400 bg-red-500/10 border-red-500/25",
};
