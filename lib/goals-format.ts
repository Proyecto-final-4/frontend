import { formatMoney } from "@/lib/money-format";

export function goalProgressPercent(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  const raw = (currentAmount / targetAmount) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

// Delega a money-format con perfil "goal" (ARS, sin decimales)
export function formatGoalMoney(amount: number): string {
  return formatMoney(amount, "goal");
}

export function formatGoalDate(isoDate: string | null): string {
  if (!isoDate) return "Sin fecha límite";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Sin fecha límite";
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
