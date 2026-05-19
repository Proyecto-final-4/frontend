import Link from "next/link";
import { cn } from "@/lib/utils";

interface TransactionPaginationProps {
  page: number;
  totalPages: number;
  queryString: string;
}

function pageHref(page: number, queryString: string): string {
  const params = new URLSearchParams(queryString);
  params.set("page", String(page));
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

export function TransactionPagination({
  page,
  totalPages,
  queryString,
}: TransactionPaginationProps) {
  if (totalPages <= 1) return null;

  const prevPage = page - 1;
  const nextPage = page + 1;
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  const linkClass = cn(
    "inline-flex items-center rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-medium",
    "text-on-surface transition-colors hover:bg-surface-container",
  );

  return (
    <nav
      className="mt-6 flex items-center justify-between gap-4"
      aria-label="Paginación de transacciones"
    >
      {hasPrev ? (
        <Link href={pageHref(prevPage, queryString)} className={linkClass}>
          Anterior
        </Link>
      ) : (
        <span className={cn(linkClass, "pointer-events-none opacity-40")}>Anterior</span>
      )}

      <p className="text-xs text-on-surface-variant">
        Página {page + 1} de {totalPages}
      </p>

      {hasNext ? (
        <Link href={pageHref(nextPage, queryString)} className={linkClass}>
          Siguiente
        </Link>
      ) : (
        <span className={cn(linkClass, "pointer-events-none opacity-40")}>Siguiente</span>
      )}
    </nav>
  );
}
