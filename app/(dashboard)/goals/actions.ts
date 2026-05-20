"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createGoal, deleteGoal, updateGoal } from "@/sdk/goals";
import { getServerToken } from "@/shared/utils/auth-server";
import type { SavingsGoal } from "@/types/goals";

export type GoalActionResult = { ok: true; goal?: SavingsGoal } | { ok: false; error: string };

const createGoalSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").trim(),
  description: z.string().trim().optional(),
  targetAmount: z.coerce.number().positive("El monto objetivo debe ser mayor a cero"),
  targetDate: z.string().optional(),
});

const contributeGoalSchema = z.object({
  goalId: z.string().min(1, "ID de meta requerido"),
  amount: z.number().positive("El aporte debe ser mayor a cero"),
  currentAmount: z.number().min(0),
});

function fail(err: unknown, fallback: string): GoalActionResult {
  return { ok: false, error: err instanceof Error ? err.message : fallback };
}

export async function createGoalAction(formData: FormData): Promise<GoalActionResult> {
  try {
    const raw = {
      name: formData.get("name"),
      description: formData.get("description") ?? undefined,
      targetAmount: formData.get("targetAmount"),
      targetDate: formData.get("targetDate") ?? undefined,
    };

    const result = createGoalSchema.safeParse(raw);
    if (!result.success) {
      const first = result.error.issues[0];
      return { ok: false, error: first?.message ?? "Datos inválidos." };
    }

    const { name, description, targetAmount, targetDate } = result.data;
    const token = await getServerToken();

    const goal = await createGoal(token, {
      name,
      description: description || undefined,
      targetAmount,
      targetDate: targetDate || undefined,
    });
    revalidatePath("/goals");
    return { ok: true, goal };
  } catch (err) {
    return fail(err, "Error al crear la meta");
  }
}

export async function contributeGoalAction(
  goalId: string,
  amount: number,
  currentAmount: number,
): Promise<GoalActionResult> {
  try {
    const result = contributeGoalSchema.safeParse({ goalId, amount, currentAmount });
    if (!result.success) {
      const first = result.error.issues[0];
      return { ok: false, error: first?.message ?? "Datos inválidos." };
    }

    const token = await getServerToken();
    const goal = await updateGoal(token, result.data.goalId, {
      currentAmount: result.data.currentAmount + result.data.amount,
    });
    revalidatePath("/goals");
    return { ok: true, goal };
  } catch (err) {
    return fail(err, "Error al registrar el aporte");
  }
}

export async function completeGoalAction(goalId: string): Promise<GoalActionResult> {
  try {
    const token = await getServerToken();
    const goal = await updateGoal(token, goalId, { isCompleted: true });
    revalidatePath("/goals");
    return { ok: true, goal };
  } catch (err) {
    return fail(err, "Error al completar la meta");
  }
}

export async function deleteGoalAction(goalId: string): Promise<GoalActionResult> {
  try {
    const token = await getServerToken();
    await deleteGoal(token, goalId);
    revalidatePath("/goals");
    return { ok: true };
  } catch (err) {
    return fail(err, "Error al eliminar la meta");
  }
}
