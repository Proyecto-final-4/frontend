export type BudgetPeriod = "DAILY" | "WEEKLY" | "MONTHLY";

export interface Budget {
  id: string;
  categoryId: string;
  categoryName?: string;
  amountLimit: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface BudgetStatus {
  spent: number;
  remaining: number;
  percentage: number;
  periodStart: string;
  periodEnd: string;
}

export interface BudgetWithStatus extends Budget {
  status: BudgetStatus | null;
}

export interface CreateBudgetPayload {
  categoryId: string;
  amountLimit: number;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateBudgetPayload {
  categoryId?: string;
  amountLimit?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}
