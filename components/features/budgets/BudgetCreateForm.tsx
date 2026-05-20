"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleFormPanel } from "@/components/ui/collapsible-form-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBudgetAction } from "@/app/(dashboard)/budgets/actions";
import { formSelectClassName } from "@/lib/form-styles";
import type { BudgetPeriod } from "@/types/budget";
import type { Category } from "@/types/category";

const PERIOD_OPTIONS: { value: BudgetPeriod; label: string }[] = [
  { value: "DAILY", label: "Diario" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensual" },
];

interface BudgetCreateFormProps {
  categories: Category[];
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BudgetCreateForm({ categories }: BudgetCreateFormProps) {
  const [state, formAction, isPending] = useActionState(createBudgetAction, null);
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <CollapsibleFormPanel title="Nuevo presupuesto">
      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className={formSelectClassName}
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona una categoría de gasto
            </option>
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amountLimit">Monto límite</Label>
          <Input
            id="amountLimit"
            name="amountLimit"
            type="number"
            min={1}
            step={1}
            required
            placeholder="500000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="period">Período</Label>
          <select
            id="period"
            name="period"
            required
            className={formSelectClassName}
            defaultValue="MONTHLY"
          >
            {PERIOD_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha de inicio</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={todayIsoDate()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha fin (opcional)</Label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={isPending || expenseCategories.length === 0}>
            {isPending ? "Creando..." : "Crear presupuesto"}
          </Button>
        </div>
        {state?.error ? (
          <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>
        ) : null}
      </form>
    </CollapsibleFormPanel>
  );
}
