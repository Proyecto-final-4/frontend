import type { BudgetPeriod } from "@/types/budget";
import { formatMoney } from "@/lib/money-format";

const PERIOD_LABELS: Record<BudgetPeriod, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
};

export function formatBudgetPeriod(period: BudgetPeriod): string {
  return PERIOD_LABELS[period];
}

// Delega a money-format con perfil "budget" (ARS, sin decimales)
export function formatCurrency(amount: number): string {
  return formatMoney(amount, "budget");
}

export function getProgressBarClass(percentage: number): string {
  if (percentage >= 100) return "bg-destructive";
  if (percentage >= 80) return "bg-amber-500";
  return "bg-primary";
}

export function getProgressWidth(percentage: number): number {
  return Math.min(Math.max(percentage, 0), 100);
}
