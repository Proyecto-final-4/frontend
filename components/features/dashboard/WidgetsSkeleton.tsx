import { Skeleton } from "@/components/ui/skeleton";

export function WidgetsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando resumen financiero">
      <Skeleton className="h-24 w-full" rounded="lg" />
      <Skeleton className="h-40 w-full" rounded="lg" />
      <Skeleton className="h-28 w-full" rounded="lg" />
    </div>
  );
}
