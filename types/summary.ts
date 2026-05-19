export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
}

export interface SummaryResponse {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number | null;
  incomeByCategory: CategorySummary[];
  expenseByCategory: CategorySummary[];
}

export interface MetricChange {
  absolute: number;
  percentage: number | null;
}

export interface SummaryTrendsResponse {
  current: SummaryResponse;
  previous: SummaryResponse;
  diff: {
    incomeChange: MetricChange;
    expenseChange: MetricChange;
    balanceChange: MetricChange;
    byCategory: unknown[];
  };
}

export interface MonthPeriod {
  from: string;
  to: string;
}
