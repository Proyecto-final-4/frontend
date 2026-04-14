"use client";

import { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import type { InterruptMessage } from "@/types/chat";

interface Props {
  message: InterruptMessage;
  onResume: (value: unknown) => void;
}

/**
 * Renders a HITL interrupt.
 *
 * The interrupt `value` from the agent can be:
 *   - A plain string  → shown as the prompt text
 *   - An object with a `message` / `prompt` / `question` field → that field is shown
 *   - Anything else   → pretty-printed JSON
 *
 * Resolving sends `true` (confirm) or `false` (cancel) back unless the agent
 * sent a custom `confirmValue` / `cancelValue` in the interrupt payload.
 */
export function InterruptBubble({ message, onResume }: Props) {
  const { value, resolved } = message;
  const [customInput, setCustomInput] = useState("");

  // Extract human-readable prompt from the interrupt value
  const prompt =
    typeof value === "string"
      ? value
      : value != null && typeof value === "object"
        ? ((value as Record<string, unknown>).message ??
          (value as Record<string, unknown>).prompt ??
          (value as Record<string, unknown>).question ??
          null)
        : null;

  const promptText = typeof prompt === "string" ? prompt : null;
  const requiresInput =
    value != null &&
    typeof value === "object" &&
    (value as Record<string, unknown>).type === "input";

  if (resolved) {
    return (
      <div className="flex justify-start my-1">
        <div className="flex items-center gap-2 max-w-[80%] bg-surface-container-low border border-outline-variant/20 rounded-xl px-3.5 py-2.5 opacity-50">
          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          <span className="text-xs text-on-surface-variant">Respondido</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-2">
      <div className="max-w-[80%] bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Confirmación requerida
          </span>
        </div>

        {/* Prompt text */}
        {promptText ? (
          <p className="text-sm text-on-surface leading-relaxed">{promptText}</p>
        ) : (
          <pre className="text-xs text-on-surface-variant bg-surface-container rounded-lg p-2 overflow-x-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        )}

        {/* Free-text input (when agent asks for specific text input) */}
        {requiresInput && (
          <textarea
            rows={2}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Escribe tu respuesta…"
            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
          />
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onResume(requiresInput ? customInput : true)}
            className="flex items-center gap-1.5 bg-primary text-on-primary text-xs font-semibold px-3.5 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          >
            <Check className="w-3.5 h-3.5" />
            Confirmar
          </button>
          <button
            onClick={() => onResume(false)}
            className="flex items-center gap-1.5 bg-surface-container text-on-surface-variant text-xs font-semibold px-3.5 py-1.5 rounded-full hover:bg-surface-container-high transition-colors border border-outline-variant/30"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
