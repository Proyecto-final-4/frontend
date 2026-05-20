import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import {
  formatCurrency,
  formatTransactionDate,
  transactionTypeLabel,
} from "@/shared/utils/transaction";
import type { Transaction } from "@/types/transaction";
import { Badge } from "@/components/ui/badge";
import { AnimateIn } from "@/components/ui/animate-in";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
  transaction: Transaction;
  categoryName: string;
}

export function TransactionRow({ transaction, categoryName }: TransactionRowProps) {
  const isIncome = transaction.type === "INCOME";
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;

  return (
    <AnimateIn variant="fade-up">
      <article
        className={cn(
          "group flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3",
          "transition-[background,border-color,box-shadow] duration-200",
          "hover:bg-card/80 hover:border-primary/15 hover:shadow-sm",
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110",
            isIncome ? "bg-primary/15 text-primary" : "bg-tertiary/15 text-tertiary",
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>

        <section className="min-w-0 flex-grow">
          <p className="truncate text-sm font-semibold text-foreground">
            {transaction.description}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap mt-0.5">
            <span>
              {formatTransactionDate(transaction.transactionDate)} · {categoryName}
            </span>
            <Badge variant={isIncome ? "lime" : "warning"}>
              {transactionTypeLabel(transaction.type)}
            </Badge>
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
    </AnimateIn>
  );
}
