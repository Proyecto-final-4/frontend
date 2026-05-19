import { BudgetCard } from "@/components/features/budgets/BudgetCard";
import type { BudgetWithStatus } from "@/types/budget";

interface BudgetsListProps {
  budgets: BudgetWithStatus[];
}

export function BudgetsList({ budgets }: BudgetsListProps) {
  if (budgets.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant rounded-2xl border border-dashed border-outline-variant/40 p-8 text-center">
        Aun no tienes presupuestos. Crea uno con el formulario o pidelo al asistente en el chat.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {budgets.map((budget) => (
        <BudgetCard key={budget.id} budget={budget} />
      ))}
    </div>
  );
}
