import { DashboardShell } from "@/components/layout/DashboardShell";
import { GoalsView } from "@/components/features/goals/GoalsView";
import { fetchGoals } from "@/sdk/goals";
import { getServerToken } from "@/shared/utils/auth-server";
import type { SavingsGoal } from "@/types/goals";

export default async function GoalsPage() {
  let goals: SavingsGoal[] = [];
  let loadError: string | null = null;

  try {
    const token = await getServerToken();
    goals = await fetchGoals(token);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "No se pudieron cargar las metas";
  }

  return (
    <DashboardShell
      activeHref="/goals"
      title="Metas de ahorro"
      subtitle="Progreso hacia tus objetivos"
    >
      <GoalsView initialGoals={goals} loadError={loadError} />
    </DashboardShell>
  );
}
