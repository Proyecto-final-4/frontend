import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CreateTransactionForm } from "@/components/features/transactions/CreateTransactionForm";
import { TransactionFilters } from "@/components/features/transactions/TransactionFilters";
import { TransactionPagination } from "@/components/features/transactions/TransactionPagination";
import { TransactionRow } from "@/components/features/transactions/TransactionRow";
import { getCategories } from "@/sdk/categories";
import { getTransactions } from "@/sdk/transactions";
import { getServerToken } from "@/shared/utils/auth-server";
import type { TransactionType } from "@/types/transaction";
function parseTransactionType(value?: string): TransactionType | undefined {
  return value === "INCOME" || value === "EXPENSE" ? value : undefined;
}
function buildQueryString(params: Record<string, string | undefined>): string {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) s.set(k, v);
  return s.toString();
}
export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    type?: string;
    categoryId?: string;
    page?: string;
    size?: string;
  }>;
}) {
  const token = await getServerToken();
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page ?? "0") || 0);
  const size = Math.min(50, Math.max(1, Number(sp.size ?? "20") || 20));
  const type = parseTransactionType(sp.type);
  const from = sp.from?.trim() || undefined;
  const to = sp.to?.trim() || undefined;
  const categoryId = sp.categoryId?.trim() || undefined;
  const listParams = { from, to, type, categoryId, page, size };
  const queryForPagination = buildQueryString({ from, to, type, categoryId, size: String(size) });
  const [categories, transactionsPage] = await Promise.all([
    getCategories(token),
    getTransactions(token, listParams),
  ]);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  return (
    <DashboardShell
      activeHref="/transactions"
      title="Transacciones"
      subtitle="Historial financiero"
    >
      <section className="max-w-5xl mx-auto space-y-8">
        <Suspense fallback={null}>
          <TransactionFilters categories={categories} initial={{ from, to, type, categoryId }} />
        </Suspense>
        <CreateTransactionForm categories={categories} />
        <section>
          <header className="flex justify-between mb-4">
            <h2 className="font-bold">Movimientos</h2>
            <p className="text-xs">{transactionsPage.totalElements} registros</p>
          </header>
          {transactionsPage.content.length === 0 ? (
            <p className="text-center py-8">Sin resultados</p>
          ) : (
            <ul className="space-y-2">
              {transactionsPage.content.map((tx) => (
                <li key={tx.id}>
                  <TransactionRow
                    transaction={tx}
                    categoryName={
                      tx.categoryName ?? categoryMap.get(tx.categoryId) ?? "Sin categoria"
                    }
                  />
                </li>
              ))}
            </ul>
          )}
          <TransactionPagination
            page={transactionsPage.number}
            totalPages={transactionsPage.totalPages}
            queryString={queryForPagination}
          />
        </section>
      </section>
    </DashboardShell>
  );
}
