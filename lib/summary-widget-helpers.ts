import type { CategorySummary, SummaryResponse } from "@/types/summary";
export function isEmptySummaryPeriod(summary: SummaryResponse): boolean {
  return summary.totalIncome === 0 && summary.totalExpense === 0;
}
export function topExpenseCategories(
  expenseByCategory: CategorySummary[],
  limit = 3,
): CategorySummary[] {
  return [...expenseByCategory].sort((a, b) => b.total - a.total).slice(0, limit);
}
