"use server";

import { revalidatePath } from "next/cache";
import { createBudget, deleteBudget, updateBudget } from "@/sdk/budgets";
import { getServerToken } from "@/shared/utils/auth-server";
import type { BudgetPeriod, CreateBudgetPayload } from "@/types/budget";

export async function createBudgetAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  try {
    const token = await getServerToken();
    const categoryId = String(formData.get("categoryId") ?? "");
    const amountLimit = Number(formData.get("amountLimit"));
    const period = String(formData.get("period") ?? "") as BudgetPeriod;
    const startDate = String(formData.get("startDate") ?? "");
    const endDateRaw = formData.get("endDate");
    const endDate = endDateRaw ? String(endDateRaw) : undefined;

    if (!categoryId || !startDate || !period) {
      return { error: "Completa categoria, periodo y fecha de inicio." };
    }
    if (!Number.isFinite(amountLimit) || amountLimit <= 0) {
      return { error: "El monto limite debe ser mayor a cero." };
    }

    const payload: CreateBudgetPayload = {
      categoryId,
      amountLimit,
      period,
      startDate,
      ...(endDate ? { endDate } : {}),
    };

    await createBudget(token, payload);
    revalidatePath("/budgets");
    return null;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo crear el presupuesto." };
  }
}

export async function toggleBudgetActiveAction(id: string, isActive: boolean): Promise<void> {
  const token = await getServerToken();
  await updateBudget(token, id, { isActive });
  revalidatePath("/budgets");
}

export async function deleteBudgetAction(id: string): Promise<void> {
  const token = await getServerToken();
  await deleteBudget(token, id);
  revalidatePath("/budgets");
}
