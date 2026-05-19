"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Pause, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteBudgetAction, toggleBudgetActiveAction } from "@/app/(dashboard)/budgets/actions";
import {
  formatBudgetPeriod,
  formatCurrency,
  getProgressBarClass,
  getProgressWidth,
} from "@/shared/utils/budget";
import type { BudgetWithStatus } from "@/types/budget";
import { cn } from "@/lib/utils";

interface BudgetCardProps {
  budget: BudgetWithStatus;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const status = budget.status;
  const percentage = status?.percentage ?? 0;
  const isOverLimit = percentage >= 100;

  function handleToggleActive() {
    setError(null);
    startTransition(async () => {
      try {
        await toggleBudgetActiveAction(budget.id, !budget.isActive);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo actualizar el presupuesto.");
      }
    });
  }

  function handleDelete() {
    const label = budget.categoryName ?? "este presupuesto";
    if (!window.confirm(`Eliminar el presupuesto de ${label}? Esta accion no se puede deshacer.`))
      return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteBudgetAction(budget.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo eliminar el presupuesto.");
      }
    });
  }

  return (
    <article
      className={cn(
        "rounded-2xl border border-outline-variant/30 bg-card p-5 shadow-sm transition-opacity",
        !budget.isActive && "opacity-60",
        isPending && "pointer-events-none opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface font-headline">
            {budget.categoryName ?? "Categoria"}
          </h3>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {formatBudgetPeriod(budget.period)} · limite {formatCurrency(budget.amountLimit)}
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1">
            {budget.startDate}
            {budget.endDate ? ` → ${budget.endDate}` : ""}
            {!budget.isActive ? " · Pausado" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleToggleActive}
            disabled={isPending}
            aria-label={budget.isActive ? "Pausar presupuesto" : "Reactivar presupuesto"}
          >
            {budget.isActive ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Eliminar presupuesto"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      {status ? (
        <>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-on-surface-variant">
              Gastado: <strong className="text-on-surface">{formatCurrency(status.spent)}</strong>
            </span>
            <span className="text-on-surface-variant">
              Restante:{" "}
              <strong className={cn(isOverLimit ? "text-destructive" : "text-on-surface")}>
                {formatCurrency(status.remaining)}
              </strong>
            </span>
          </div>
          <div
            className="h-2.5 w-full rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className={cn(
                "block h-full rounded-full transition-all duration-300",
                getProgressBarClass(percentage),
              )}
              style={{ width: `${getProgressWidth(percentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span
              className={cn(
                "text-xs font-semibold",
                isOverLimit ? "text-destructive" : "text-on-surface-variant",
              )}
            >
              {Math.round(percentage)}% del limite
            </span>
            {isOverLimit ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                <AlertTriangle className="size-3.5" /> Limite superado
              </span>
            ) : null}
          </div>
        </>
      ) : (
        <p className="text-sm text-on-surface-variant">
          No se pudo cargar el progreso del periodo.
        </p>
      )}
      {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
    </article>
  );
}
