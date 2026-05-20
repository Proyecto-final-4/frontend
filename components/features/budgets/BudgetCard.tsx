"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Pause, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { deleteBudgetAction, toggleBudgetActiveAction } from "@/app/(dashboard)/budgets/actions";
import { formatBudgetPeriod, formatCurrency } from "@/shared/utils/budget";
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
    if (!window.confirm(`Eliminar el presupuesto de ${label}? Esta acción no se puede deshacer.`))
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

  const badgeVariant = isOverLimit ? "error" : percentage >= 70 ? "warning" : "lime";

  return (
    <Card
      variant="glass"
      hoverable
      className={cn(
        !budget.isActive && "opacity-60 grayscale-[30%]",
        isPending && "pointer-events-none opacity-70",
      )}
    >
      <CardHeader className="mb-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{budget.categoryName ?? "Categoría"}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatBudgetPeriod(budget.period)} · límite {formatCurrency(budget.amountLimit)}
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
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
              className="hover:text-primary hover:bg-primary/10"
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
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {status ? (
          <>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">
                Gastado: <strong className="text-foreground">{formatCurrency(status.spent)}</strong>
              </span>
              <span className="text-muted-foreground">
                Restante:{" "}
                <strong className={cn(isOverLimit ? "text-destructive" : "text-foreground")}>
                  {formatCurrency(status.remaining)}
                </strong>
              </span>
            </div>
            <Progress value={percentage} max={100} showPercent label="Del límite" />
            <CardFooter className="mt-3 px-0 pb-0">
              <Badge variant={badgeVariant} dot>
                {Math.round(percentage)}% del límite
              </Badge>
              {isOverLimit ? (
                <Badge variant="error" dot className="ml-auto">
                  <AlertTriangle className="size-3.5" /> Límite superado
                </Badge>
              ) : null}
            </CardFooter>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No se pudo cargar el progreso del periodo.
          </p>
        )}
        {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
