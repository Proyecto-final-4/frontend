export type TransactionType = "INCOME" | "EXPENSE";
export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  description: string;
  notes?: string | null;
  categoryName?: string | null;
}
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
export interface TransactionListParams {
  type?: TransactionType;
  categoryId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
export interface CreateTransactionPayload {
  categoryId: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  description: string;
  notes?: string;
}
