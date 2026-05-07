import { CheckCircle2, Loader2, XCircle, Wrench } from "lucide-react";
import type { ToolCallPart } from "@/types/chat";

// Human-readable labels for each tool
const TOOL_LABELS: Record<string, string> = {
  create_transaction: "Creando transacción",
  update_transaction: "Actualizando transacción",
  delete_transaction: "Eliminando transacción",
  get_transactions: "Obteniendo transacciones",
  get_transaction_detail: "Consultando detalle de transacción",
  get_categories: "Obteniendo categorías",
  create_category: "Creando categoría",
  update_category: "Actualizando categoría",
  delete_category: "Eliminando categoría",
};

interface Props {
  part: ToolCallPart;
}

export function ToolCallBubble({ part }: Props) {
  const label = TOOL_LABELS[part.name] ?? part.name.replace(/_/g, " ");

  return (
    <div className="flex justify-start my-1">
      <div className="flex items-start gap-2.5 max-w-[80%] bg-surface-container-low border border-outline-variant/20 rounded-xl px-3.5 py-2.5">
        {/* Tool icon */}
        <div className="mt-0.5 flex-shrink-0">
          <Wrench className="w-3.5 h-3.5 text-on-surface-variant/50" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Status + label row */}
          <div className="flex items-center gap-1.5">
            {part.status === "running" && (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" />
            )}
            {part.status === "done" && (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            )}
            {part.status === "error" && (
              <XCircle className="w-3.5 h-3.5 text-error flex-shrink-0" />
            )}
            <span className="text-xs font-medium text-on-surface-variant truncate">{label}</span>
          </div>

          {/* Error detail */}
          {part.status === "error" && part.error != null && (
            <p className="mt-1 text-[11px] text-error/80 leading-snug">
              {typeof part.error === "string" ? part.error : JSON.stringify(part.error)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
