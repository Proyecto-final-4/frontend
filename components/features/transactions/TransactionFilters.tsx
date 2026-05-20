"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleFormPanel } from "@/components/ui/collapsible-form-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formSelectClassName } from "@/lib/form-styles";
import type { Category } from "@/types/category";
import type { TransactionType } from "@/types/transaction";

interface TransactionFiltersProps {
  categories: Category[];
  initial: {
    from?: string;
    to?: string;
    type?: TransactionType;
    categoryId?: string;
  };
}

export function TransactionFilters({ categories, initial }: TransactionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());

    const fields = ["from", "to", "type", "categoryId"] as const;
    for (const field of fields) {
      const value = String(formData.get(field) ?? "").trim();
      if (value) {
        params.set(field, value);
      } else {
        params.delete(field);
      }
    }

    params.delete("page");

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `/transactions?${query}` : "/transactions");
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters(new FormData(event.currentTarget));
  }

  function clearFilters() {
    startTransition(() => {
      router.push("/transactions");
    });
  }

  return (
    <CollapsibleFormPanel title="Filtros">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="from">Desde</Label>
          <Input id="from" name="from" type="date" defaultValue={initial.from ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">Hasta</Label>
          <Input id="to" name="to" type="date" defaultValue={initial.to ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            name="type"
            className={formSelectClassName}
            defaultValue={initial.type ?? ""}
          >
            <option value="">Todos</option>
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Gasto</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <select
            id="categoryId"
            name="categoryId"
            className={formSelectClassName}
            defaultValue={initial.categoryId ?? ""}
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Aplicando…" : "Aplicar filtros"}
          </Button>
          <Button type="button" variant="outline" disabled={isPending} onClick={clearFilters}>
            Limpiar
          </Button>
        </div>
      </form>
    </CollapsibleFormPanel>
  );
}
