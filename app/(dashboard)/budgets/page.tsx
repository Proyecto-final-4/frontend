import { DashboardShell } from "@/components/layout/DashboardShell";
import { BudgetCreateForm } from "@/components/features/budgets/BudgetCreateForm";
import { BudgetsList } from "@/components/features/budgets/BudgetsList";
import { getBudgets, getBudgetStatus } from "@/sdk/budgets";
import { getCategories } from "@/sdk/categories";
import { getServerToken } from "@/shared/utils/auth-server";
import type { BudgetWithStatus } from "@/types/budget";

async function loadBudgetsWithStatus(token: string): Promise<BudgetWithStatus[]> {
  const budgets = await getBudgets(token);
  return Promise.all(
    budgets.map(async (budget) => {
      try {
        const status = await getBudgetStatus(token, budget.id);
        return { ...budget, status };
      } catch {
        return { ...budget, status: null };
      }
    }),
  );
}

export default async function BudgetsPage() {
  const token = await getServerToken();
  const [budgets, categories] = await Promise.all([
    loadBudgetsWithStatus(token),
    getCategories(token),
  ]);

  return (
    <DashboardShell
      activeHref="/budgets"
      title="Presupuestos"
      subtitle="Control de gasto por categoria"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <BudgetCreateForm categories={categories} />
        <section>
          <h2 className="text-base font-bold text-on-surface font-headline mb-4">
            Tus presupuestos
          </h2>
          <BudgetsList budgets={budgets} />
        </section>
      </div>
    </DashboardShell>
  );
}
