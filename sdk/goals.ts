import { javaFetch } from "@/sdk/_http";
import type { CreateGoalPayload, SavingsGoal, UpdateGoalPayload } from "@/types/goals";

async function parseGoalsError(res: Response, fallback: string): Promise<never> {
  const body = await res.json().catch(() => null);
  const message =
    body && typeof body === "object" && "message" in body && typeof body.message === "string"
      ? body.message
      : body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : fallback;
  throw new Error(message);
}

export async function fetchGoals(token: string): Promise<SavingsGoal[]> {
  const res = await javaFetch("/goals", { method: "GET", token });
  if (!res.ok) await parseGoalsError(res, "No se pudieron cargar las metas");
  return res.json() as Promise<SavingsGoal[]>;
}

export async function createGoal(token: string, payload: CreateGoalPayload): Promise<SavingsGoal> {
  const res = await javaFetch("/goals", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseGoalsError(res, "No se pudo crear la meta");
  return res.json() as Promise<SavingsGoal>;
}

export async function updateGoal(
  token: string,
  id: string,
  payload: UpdateGoalPayload,
): Promise<SavingsGoal> {
  const res = await javaFetch(`/goals/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseGoalsError(res, "No se pudo actualizar la meta");
  return res.json() as Promise<SavingsGoal>;
}

export async function deleteGoal(token: string, id: string): Promise<void> {
  const res = await javaFetch(`/goals/${id}`, { method: "DELETE", token });
  if (!res.ok) await parseGoalsError(res, "No se pudo eliminar la meta");
}
