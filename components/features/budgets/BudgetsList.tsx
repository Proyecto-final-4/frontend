"use client";

import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { BudgetCard } from "@/components/features/budgets/BudgetCard";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { BudgetWithStatus } from "@/types/budget";

interface BudgetsListProps {
  budgets: BudgetWithStatus[];
}

export function BudgetsList({ budgets }: BudgetsListProps) {
  if (budgets.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Sin presupuestos"
        description="Crea uno con el formulario o pídelo al asistente en el chat."
      />
    );
  }

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {budgets.map((budget) => (
        <motion.div key={budget.id} variants={staggerItem}>
          <BudgetCard budget={budget} />
        </motion.div>
      ))}
    </motion.div>
  );
}
