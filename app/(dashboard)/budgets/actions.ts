"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createBudget, deleteBudget, updateBudget } from "@/sdk/budgets";
import { getServerToken } from "@/shared/utils/auth-server";
import type { CreateBudgetPayload } from "@/types/budget";

const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "La categoría es requerida"),
  amountLimit: z.coerce.number().positive("El monto límite debe ser mayor a cero"),
  period: z.enum(["DAILY", "WEEKLY", "MONTHLY"], { error: "Selecciona un período válido" }),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().optional(),
});

export async function createBudgetAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  try {
    const raw = {
      categoryId: formData.get("categoryId"),
      amountLimit: formData.get("amountLimit"),
      period: formData.get("period"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate") ?? undefined,
    };

    const result = createBudgetSchema.safeParse(raw);
    if (!result.success) {
      const first = result.error.issues[0];
      return { error: first?.message ?? "Datos inválidos." };
    }

    const { categoryId, amountLimit, period, startDate, endDate } = result.data;
    const token = await getServerToken();

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
