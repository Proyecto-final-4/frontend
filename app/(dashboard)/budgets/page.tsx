import { DashboardShell } from "@/components/layout/DashboardShell";
import { BudgetCreateForm } from "@/components/features/budgets/BudgetCreateForm";
import { BudgetsList } from "@/components/features/budgets/BudgetsList";
import { getBudgets, getBudgetStatus } from "@/sdk/budgets";
import { getCategories } from "@/sdk/categories";
import { getServerToken } from "@/shared/utils/auth-server";
import type { BudgetWithStatus } from "@/types/budget";
import type { Category } from "@/types/category";

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
  let budgets: BudgetWithStatus[] = [];
  let categories: Category[] = [];
  let loadError: string | null = null;

  try {
    const token = await getServerToken();
    const [loadedBudgets, loadedCategories] = await Promise.all([
      loadBudgetsWithStatus(token),
      getCategories(token),
    ]);
    budgets = loadedBudgets;
    categories = loadedCategories;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "No se pudieron cargar los presupuestos";
  }

  return (
    <DashboardShell
      activeHref="/budgets"
      title="Presupuestos"
      subtitle="Control de gasto por categoría"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {loadError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadError}
          </p>
        ) : null}
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
