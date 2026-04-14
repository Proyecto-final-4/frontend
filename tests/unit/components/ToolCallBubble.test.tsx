import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCallBubble } from "@/components/chat/ToolCallBubble";
import type { ToolCallPart } from "@/types/chat";

const base: ToolCallPart = {
  kind: "tool_call",
  toolCallId: "call-1",
  name: "get_transactions",
  status: "running",
};

describe("ToolCallBubble", () => {
  it("renders the human-readable label for known tools", () => {
    render(<ToolCallBubble part={base} />);
    expect(screen.getByText("Obteniendo transacciones")).toBeInTheDocument();
  });

  it("falls back to formatted tool name for unknown tools", () => {
    render(<ToolCallBubble part={{ ...base, name: "unknown_tool" }} />);
    expect(screen.getByText("unknown tool")).toBeInTheDocument();
  });

  it("shows spinner when status is running", () => {
    const { container } = render(<ToolCallBubble part={{ ...base, status: "running" }} />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("does not show spinner when status is done", () => {
    const { container } = render(<ToolCallBubble part={{ ...base, status: "done" }} />);
    expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
  });

  it("does not show error text when status is done", () => {
    render(<ToolCallBubble part={{ ...base, status: "done", result: { id: 1 } }} />);
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("shows error message when status is error with string error", () => {
    render(<ToolCallBubble part={{ ...base, status: "error", error: "timeout reached" }} />);
    expect(screen.getByText("timeout reached")).toBeInTheDocument();
  });

  it("shows serialized JSON when error is an object", () => {
    render(<ToolCallBubble part={{ ...base, status: "error", error: { code: 500 } }} />);
    expect(screen.getByText('{"code":500}')).toBeInTheDocument();
  });

  it("renders correct labels for all known tools", () => {
    const cases: Array<[string, string]> = [
      ["create_transaction", "Creando transacción"],
      ["get_transactions", "Obteniendo transacciones"],
      ["get_transaction_detail", "Consultando detalle de transacción"],
      ["get_categories", "Obteniendo categorías"],
      ["create_category", "Creando categoría"],
      ["update_category", "Actualizando categoría"],
      ["delete_category", "Eliminando categoría"],
    ];
    for (const [name, label] of cases) {
      const { unmount } = render(<ToolCallBubble part={{ ...base, name }} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });
});
