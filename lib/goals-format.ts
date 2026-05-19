export function goalProgressPercent(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  const raw = (currentAmount / targetAmount) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function formatGoalMoney(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatGoalDate(isoDate: string | null): string {
  if (!isoDate) return "Sin fecha lÃ­mite";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Sin fecha lÃ­mite";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
