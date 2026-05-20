import type { TransactionType } from "@/types/transaction";

// Re-exportar desde money-format para compatibilidad
export { formatCurrency } from "@/lib/money-format";

export function formatTransactionDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function transactionTypeLabel(type: TransactionType): string {
  return type === "INCOME" ? "Ingreso" : "Gasto";
}
