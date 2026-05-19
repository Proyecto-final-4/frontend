import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import {
  formatCurrency,
  formatTransactionDate,
  transactionTypeLabel,
} from "@/shared/utils/transaction";
import type { Transaction } from "@/types/transaction";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
  transaction: Transaction;
  categoryName: string;
}

export function TransactionRow({ transaction, categoryName }: TransactionRowProps) {
  const isIncome = transaction.type === "INCOME";
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;

  return (
    <article
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-card px-4 py-3",
        "transition-colors hover:bg-surface-container-low/60",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
          isIncome ? "bg-primary/15 text-primary" : "bg-tertiary/15 text-tertiary",
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>

      <section className="min-w-0 flex-grow">
        <p className="truncate text-sm font-semibold text-on-surface">{transaction.description}</p>
        <p className="text-xs text-on-surface-variant">
          {formatTransactionDate(transaction.transactionDate)} · {categoryName} ·{" "}
          {transactionTypeLabel(transaction.type)}
        </p>
      </section>

      <p
        className={cn(
          "flex-shrink-0 text-sm font-bold tabular-nums",
          isIncome ? "text-primary" : "text-tertiary",
        )}
      >
        {isIncome ? "+" : "−"}
        {formatCurrency(transaction.amount)}
      </p>
    </article>
  );
}
