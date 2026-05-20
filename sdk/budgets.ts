import { javaFetch } from "@/sdk/_http";
import { throwJavaApiErrorFromResponse } from "@/sdk/_errors";
import type {
  Budget,
  BudgetStatus,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from "@/types/budget";

export async function getBudgets(token: string): Promise<Budget[]> {
  const res = await javaFetch("/budgets", { token });
  if (!res.ok) await throwJavaApiErrorFromResponse(res, "Failed to load budgets");
  return res.json() as Promise<Budget[]>;
}

export async function getBudgetStatus(token: string, id: string): Promise<BudgetStatus> {
  const res = await javaFetch(`/budgets/${id}/status`, { token });
  if (!res.ok) await throwJavaApiErrorFromResponse(res, "Failed to load budget status");
  return res.json() as Promise<BudgetStatus>;
}

export async function createBudget(token: string, payload: CreateBudgetPayload): Promise<Budget> {
  const res = await javaFetch("/budgets", { method: "POST", token, body: JSON.stringify(payload) });
  if (!res.ok) await throwJavaApiErrorFromResponse(res, "Failed to create budget");
  return res.json() as Promise<Budget>;
}

export async function updateBudget(
  token: string,
  id: string,
  payload: UpdateBudgetPayload,
): Promise<Budget> {
  const res = await javaFetch(`/budgets/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await throwJavaApiErrorFromResponse(res, "Failed to update budget");
  return res.json() as Promise<Budget>;
}

export async function deleteBudget(token: string, id: string): Promise<void> {
  const res = await javaFetch(`/budgets/${id}`, { method: "DELETE", token });
  if (!res.ok) await throwJavaApiErrorFromResponse(res, "Failed to delete budget");
}
