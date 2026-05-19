"use server";

import { revalidatePath } from "next/cache";
import { createGoal, deleteGoal, updateGoal } from "@/sdk/goals";
import { getServerToken } from "@/shared/utils/auth-server";
import type { SavingsGoal } from "@/types/goals";

export type GoalActionResult =
  | { ok: true; goal?: SavingsGoal }
  | { ok: false; error: string };

function fail(err: unknown, fallback: string): GoalActionResult {
  return { ok: false, error: err instanceof Error ? err.message : fallback };
}

export async function createGoalAction(formData: FormData): Promise<GoalActionResult> {
  try {
    const token = await getServerToken();
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const targetAmount = Number(formData.get("targetAmount"));
    const targetDate = String(formData.get("targetDate") ?? "").trim();
    if (!name) return { ok: false, error: "El nombre es obligatorio" };
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      return { ok: false, error: "El monto objetivo debe ser mayor a cero" };
    }
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
    const token = await getServerToken();
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, error: "El aporte debe ser mayor a cero" };
    }
    const goal = await updateGoal(token, goalId, { currentAmount: currentAmount + amount });
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
