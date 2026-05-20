"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, PiggyBank, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleFormPanel } from "@/components/ui/collapsible-form-panel";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { AnimateIn } from "@/components/ui/animate-in";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  completeGoalAction,
  contributeGoalAction,
  createGoalAction,
  deleteGoalAction,
} from "@/app/(dashboard)/goals/actions";
import { formatGoalDate, formatGoalMoney, goalProgressPercent } from "@/lib/goals-format";
import type { SavingsGoal } from "@/types/goals";
import { cn } from "@/lib/utils";

interface GoalsViewProps {
  initialGoals: SavingsGoal[];
  loadError: string | null;
}

function GoalCard({
  goal,
  onUpdated,
  onDeleted,
}: {
  goal: SavingsGoal;
  onUpdated: (g: SavingsGoal) => void;
  onDeleted: (id: string) => void;
}) {
  const [contribution, setContribution] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const percent = goalProgressPercent(goal.currentAmount, goal.targetAmount);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  function handleContribute() {
    const amount = Number(contribution);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFeedback("Ingresa un monto válido");
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const result = await contributeGoalAction(goal.id, amount, goal.currentAmount);
      if (result.ok && result.goal) {
        onUpdated(result.goal);
        setContribution("");
        setFeedback("Aporte registrado");
      } else if (!result.ok) setFeedback(result.error);
    });
  }

  function handleComplete() {
    startTransition(async () => {
      const result = await completeGoalAction(goal.id);
      if (result.ok && result.goal) {
        onUpdated(result.goal);
        setFeedback("Meta completada");
      } else if (!result.ok) setFeedback(result.error);
    });
  }

  function handleDelete() {
    if (!window.confirm(`¿Eliminar la meta "${goal.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteGoalAction(goal.id);
      if (result.ok) onDeleted(goal.id);
      else if (!result.ok) setFeedback(result.error);
    });
  }

  const feedbackIsError =
    feedback !== null &&
    (feedback.includes("Error") || feedback.includes("válido") || feedback.includes("obligatorio"));

  return (
    <Card
      variant={goal.isCompleted ? "outline" : "default"}
      hoverable={!goal.isCompleted}
      className={cn(goal.isCompleted && "border-primary/30 bg-primary/5 grayscale-[20%]")}
    >
      <CardHeader className="mb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className={cn(goal.isCompleted && "line-through text-muted-foreground")}>
            {goal.name}
          </CardTitle>
          {goal.isCompleted && (
            <Badge variant="lime" dot>
              Completada
            </Badge>
          )}
        </div>
        <p className={cn("mt-1 text-sm text-muted-foreground", goal.isCompleted && "line-through")}>
          {goal.description?.trim() || "Sin descripción"}
        </p>
      </CardHeader>
      <CardContent>
        <Progress value={percent} max={100} showPercent />
        <div className="mt-2 flex justify-between text-sm gap-2 flex-wrap">
          <span className="font-semibold tabular-nums">
            {formatGoalMoney(goal.currentAmount)} / {formatGoalMoney(goal.targetAmount)}
          </span>
          {!goal.isCompleted && (
            <span className="text-muted-foreground">Faltan {formatGoalMoney(remaining)}</span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Fecha límite: {formatGoalDate(goal.targetDate)}
        </p>
        {!goal.isCompleted && (
          <div className="mt-4 flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-1 min-w-[140px]">
              <Label htmlFor={`contrib-${goal.id}`} className="text-xs">
                Aporte
              </Label>
              <Input
                id={`contrib-${goal.id}`}
                type="number"
                min={1}
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                disabled={isPending}
                className="h-8"
              />
            </div>
            <Button type="button" size="sm" onClick={handleContribute} disabled={isPending}>
              <PiggyBank className="w-3.5 h-3.5" />
              Aportar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleComplete}
              disabled={isPending}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completar
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-0 px-0 pb-0">
        {feedback && (
          <p className={cn("text-xs", feedbackIsError ? "text-destructive" : "text-primary")}>
            {feedback}
          </p>
        )}
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="ml-auto"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
}

function GoalsGrid({
  goals,
  onUpdated,
  onDeleted,
}: {
  goals: SavingsGoal[];
  onUpdated: (g: SavingsGoal) => void;
  onDeleted: (id: string) => void;
}) {
  return (
    <motion.div
      className="grid gap-4 lg:grid-cols-2"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {goals.map((goal) => (
        <motion.div key={goal.id} variants={staggerItem}>
          <GoalCard goal={goal} onUpdated={onUpdated} onDeleted={onDeleted} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function GoalsView({ initialGoals, loadError }: GoalsViewProps) {
  const [goals, setGoals] = useState(initialGoals);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isCreating, startCreate] = useTransition();

  const { activeGoals, completedGoals } = useMemo(() => {
    const active: SavingsGoal[] = [];
    const completed: SavingsGoal[] = [];
    for (const g of goals) {
      if (g.isCompleted) completed.push(g);
      else active.push(g);
    }
    return { activeGoals: active, completedGoals: completed };
  }, [goals]);

  function upsertGoal(updated: SavingsGoal) {
    setGoals((prev) => {
      const idx = prev.findIndex((g) => g.id === updated.id);
      if (idx === -1) return [...prev, updated];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startCreate(async () => {
      const result = await createGoalAction(formData);
      if (result.ok && result.goal) {
        upsertGoal(result.goal);
        setFormSuccess("Meta creada correctamente");
        form.reset();
      } else if (!result.ok) setFormError(result.error);
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {loadError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}
      <AnimateIn variant="fade-up">
        <CollapsibleFormPanel
          title="Nueva meta"
          className="rounded-xl border-0 glass-card p-6 text-card-foreground shadow-sm"
        >
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="goal-name">Nombre</Label>
              <Input id="goal-name" name="name" required placeholder="Ej. Viaje a Cartagena" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="goal-desc">Descripción</Label>
              <Input id="goal-desc" name="description" placeholder="Opcional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-target">Monto objetivo (COP)</Label>
              <Input
                id="goal-target"
                name="targetAmount"
                type="number"
                min={1}
                required
                placeholder="2000000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-date">Fecha límite</Label>
              <Input id="goal-date" name="targetDate" type="date" />
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isCreating}>
                Crear meta
              </Button>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              {formSuccess && <p className="text-sm text-primary">{formSuccess}</p>}
            </div>
          </form>
        </CollapsibleFormPanel>
      </AnimateIn>
      {activeGoals.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">En progreso</h2>
          <GoalsGrid
            goals={activeGoals}
            onUpdated={upsertGoal}
            onDeleted={(id) => setGoals((p) => p.filter((g) => g.id !== id))}
          />
        </section>
      )}
      {completedGoals.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Completadas</h2>
          <GoalsGrid
            goals={completedGoals}
            onUpdated={upsertGoal}
            onDeleted={(id) => setGoals((p) => p.filter((g) => g.id !== id))}
          />
        </section>
      )}
      {goals.length === 0 && !loadError && (
        <EmptyState
          icon={PiggyBank}
          title="Sin metas"
          description="Crea una arriba o pídele al agente en el chat."
        />
      )}
    </div>
  );
}
