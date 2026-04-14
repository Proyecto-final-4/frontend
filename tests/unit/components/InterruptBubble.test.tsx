import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InterruptBubble } from "@/components/chat/InterruptBubble";
import type { InterruptMessage } from "@/types/chat";

const baseMsg: InterruptMessage = {
  id: "irq-1",
  role: "interrupt",
  interruptId: "irq-1",
  value: "¿Confirmas el registro de la transacción?",
};

describe("InterruptBubble", () => {
  // ── Prompt rendering ───────────────────────────────────────────────────────

  it("renders string value as prompt text", () => {
    render(<InterruptBubble message={baseMsg} onResume={vi.fn()} />);
    expect(screen.getByText("¿Confirmas el registro de la transacción?")).toBeInTheDocument();
  });

  it("renders message field from object value", () => {
    const msg = { ...baseMsg, value: { message: "Revisa los datos antes de continuar" } };
    render(<InterruptBubble message={msg} onResume={vi.fn()} />);
    expect(screen.getByText("Revisa los datos antes de continuar")).toBeInTheDocument();
  });

  it("renders prompt field from object value", () => {
    const msg = { ...baseMsg, value: { prompt: "Ingresa el monto" } };
    render(<InterruptBubble message={msg} onResume={vi.fn()} />);
    expect(screen.getByText("Ingresa el monto")).toBeInTheDocument();
  });

  it("renders question field from object value", () => {
    const msg = { ...baseMsg, value: { question: "¿Estás seguro?" } };
    render(<InterruptBubble message={msg} onResume={vi.fn()} />);
    expect(screen.getByText("¿Estás seguro?")).toBeInTheDocument();
  });

  it("renders JSON for unknown object value", () => {
    const msg = { ...baseMsg, value: { unknownKey: 42 } };
    render(<InterruptBubble message={msg} onResume={vi.fn()} />);
    expect(screen.getByText(/unknownKey/)).toBeInTheDocument();
  });

  it("shows the confirmation header", () => {
    render(<InterruptBubble message={baseMsg} onResume={vi.fn()} />);
    expect(screen.getByText(/Confirmación requerida/i)).toBeInTheDocument();
  });

  // ── Actions ────────────────────────────────────────────────────────────────

  it("calls onResume(true) when Confirmar is clicked", async () => {
    const onResume = vi.fn();
    render(<InterruptBubble message={baseMsg} onResume={onResume} />);
    await userEvent.click(screen.getByText("Confirmar"));
    expect(onResume).toHaveBeenCalledOnce();
    expect(onResume).toHaveBeenCalledWith(true);
  });

  it("calls onResume(false) when Cancelar is clicked", async () => {
    const onResume = vi.fn();
    render(<InterruptBubble message={baseMsg} onResume={onResume} />);
    await userEvent.click(screen.getByText("Cancelar"));
    expect(onResume).toHaveBeenCalledOnce();
    expect(onResume).toHaveBeenCalledWith(false);
  });

  it("calls onResume with custom text when type is input and Confirmar clicked", async () => {
    const onResume = vi.fn();
    const msg = { ...baseMsg, value: { type: "input", message: "Escribe tu respuesta" } };
    render(<InterruptBubble message={msg} onResume={onResume} />);
    const textarea = screen.getByPlaceholderText("Escribe tu respuesta…");
    await userEvent.type(textarea, "mi respuesta");
    await userEvent.click(screen.getByText("Confirmar"));
    expect(onResume).toHaveBeenCalledWith("mi respuesta");
  });

  // ── Resolved state ─────────────────────────────────────────────────────────

  it('shows "Respondido" and hides buttons when resolved is true', () => {
    const msg = { ...baseMsg, resolved: true };
    render(<InterruptBubble message={msg} onResume={vi.fn()} />);
    expect(screen.getByText("Respondido")).toBeInTheDocument();
    expect(screen.queryByText("Confirmar")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancelar")).not.toBeInTheDocument();
  });

  it("does not show prompt text when resolved", () => {
    const msg = { ...baseMsg, resolved: true };
    render(<InterruptBubble message={msg} onResume={vi.fn()} />);
    expect(screen.queryByText("¿Confirmas el registro de la transacción?")).not.toBeInTheDocument();
  });
});
