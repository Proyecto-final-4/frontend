import { Wallet } from "lucide-react";
import {
  formatCurrency,
  formatDelta,
  formatPercent,
  SAVINGS_RATE_TONE_CLASS,
  savingsRateTone,
} from "@/lib/finance-format";
import type { DashboardWidgetsData } from "@/lib/dashboard-widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AnimateIn } from "@/components/ui/animate-in";
import { cn } from "@/lib/utils";

function EmptyWidgets() {
  return (
    <EmptyState
      icon={Wallet}
      title="Sin transacciones este mes"
      description="Registra movimientos o pídele al asistente que los agregue."
    />
  );
}

function DeltaRow({
  label,
  absolute,
  invertColors,
}: {
  label: string;
  absolute: number;
  invertColors?: boolean;
}) {
  const good = invertColors ? absolute < 0 : absolute > 0;
  const bad = invertColors ? absolute > 0 : absolute < 0;
  const badgeVariant = good ? "success" : bad ? "error" : "outline";

  return (
    <div className="flex items-center justify-between gap-2 text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant={badgeVariant}>{formatDelta(absolute)}</Badge>
    </div>
  );
}

export function DashboardWidgetsPanel({ data }: { data: DashboardWidgetsData }) {
  if (data.kind === "empty") return <EmptyWidgets />;

  const { summary, trends, topExpenses } = data;
  const toneClass = SAVINGS_RATE_TONE_CLASS[savingsRateTone(summary.savingsRate)];

  return (
    <div className="space-y-4">
      <AnimateIn variant="fade-up">
        <Card variant="glass" className={cn("border", toneClass)}>
          <CardHeader className="mb-2">
            <SectionLabel>Tasa de ahorro</SectionLabel>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold gradient-text tabular-nums">
              {summary.savingsRate === null ? "—" : formatPercent(summary.savingsRate)}
            </p>
          </CardContent>
        </Card>
      </AnimateIn>

      <AnimateIn variant="fade-up" delay={0.08}>
        <Card variant="default" hoverable>
          <CardHeader className="mb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Top gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {topExpenses.map((item) => (
                <li key={item.categoryId}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground">{item.categoryName}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatPercent(item.percentage, 0)}
                    </span>
                  </div>
                  <Progress value={item.percentage} max={100} />
                  <p className="text-right text-xs text-muted-foreground mt-1 tabular-nums">
                    {formatCurrency(item.total)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </AnimateIn>

      <AnimateIn variant="fade-up" delay={0.16}>
        <Card variant="default" hoverable>
          <CardHeader className="mb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              vs mes anterior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <DeltaRow label="Ingresos" absolute={trends.diff.incomeChange.absolute} />
            <DeltaRow label="Gastos" absolute={trends.diff.expenseChange.absolute} invertColors />
          </CardContent>
        </Card>
      </AnimateIn>
    </div>
  );
}
