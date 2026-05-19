import { javaFetch } from "@/sdk/_http";
import { throwJavaApiError } from "@/sdk/_errors";
import type {
  Budget,
  BudgetStatus,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from "@/types/budget";

export async function getBudgets(token: string): Promise<Budget[]> {
  const res = await javaFetch("/budgets", { token });
  if (!res.ok) throwJavaApiError(await res.text(), "Error al cargar presupuestos");
  return res.json() as Promise<Budget[]>;
}

export async function getBudgetStatus(token: string, id: string): Promise<BudgetStatus> {
  const res = await javaFetch(`/budgets/${id}/status`, { token });
  if (!res.ok) throwJavaApiError(await res.text(), "Error al cargar el estado del presupuesto");
  return res.json() as Promise<BudgetStatus>;
}

export async function createBudget(token: string, payload: CreateBudgetPayload): Promise<Budget> {
  const res = await javaFetch("/budgets", { method: "POST", token, body: JSON.stringify(payload) });
  if (!res.ok) throwJavaApiError(await res.text(), "Error al crear el presupuesto");
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
  if (!res.ok) throwJavaApiError(await res.text(), "Error al actualizar el presupuesto");
  return res.json() as Promise<Budget>;
}

export async function deleteBudget(token: string, id: string): Promise<void> {
  const res = await javaFetch(`/budgets/${id}`, { method: "DELETE", token });
  if (!res.ok) throwJavaApiError(await res.text(), "Error al eliminar el presupuesto");
}
