"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleFormPanel } from "@/components/ui/collapsible-form-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTransactionAction } from "@/app/(dashboard)/transactions/actions";
import { formSelectClassName } from "@/lib/form-styles";
import type { Category } from "@/types/category";

export function CreateTransactionForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createTransactionAction, null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <CollapsibleFormPanel title="Nueva transacción">
      {state?.error ? (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          Transacción registrada.
        </p>
      ) : null}
      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Input id="description" name="description" required maxLength={200} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className={formSelectClassName}
            defaultValue=""
          >
            <option value="" disabled>
              Seleccionar
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Monto</Label>
          <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            name="type"
            required
            className={formSelectClassName}
            defaultValue="EXPENSE"
          >
            <option value="EXPENSE">Gasto</option>
            <option value="INCOME">Ingreso</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="transactionDate">Fecha</Label>
          <Input
            id="transactionDate"
            name="transactionDate"
            type="date"
            defaultValue={today}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Input id="notes" name="notes" maxLength={500} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Registrar"}
          </Button>
        </div>
      </form>
    </CollapsibleFormPanel>
  );
}
