"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTransactionAction } from "@/app/(dashboard)/transactions/actions";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
const selectClassName = cn(
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs",
  "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
);
export function CreateTransactionForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createTransactionAction, null);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-card p-5 shadow-sm">
      <h2 className="text-base font-bold text-on-surface font-headline mb-4">Nueva transaccion</h2>
      {state?.error ? (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          Transaccion registrada.
        </p>
      ) : null}
      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        <section className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descripcion</Label>
          <Input id="description" name="description" required maxLength={200} />
        </section>
        <section className="space-y-2">
          <Label htmlFor="categoryId">Categoria</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className={selectClassName}
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
        </section>
        <section className="space-y-2">
          <Label htmlFor="amount">Monto</Label>
          <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
        </section>
        <section className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <select id="type" name="type" required className={selectClassName} defaultValue="EXPENSE">
            <option value="EXPENSE">Gasto</option>
            <option value="INCOME">Ingreso</option>
          </select>
        </section>
        <section className="space-y-2">
          <Label htmlFor="transactionDate">Fecha</Label>
          <Input
            id="transactionDate"
            name="transactionDate"
            type="date"
            defaultValue={today}
            required
          />
        </section>
        <section className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Input id="notes" name="notes" maxLength={500} />
        </section>
        <section className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Registrar"}
          </Button>
        </section>
      </form>
    </section>
  );
}
