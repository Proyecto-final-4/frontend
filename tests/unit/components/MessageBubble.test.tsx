import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { AssistantPart } from "@/types/chat";

describe("MessageBubble — user", () => {
  it("renders user message content", () => {
    render(<MessageBubble role="user" content="Hola, ¿cuánto gasté este mes?" />);
    expect(screen.getByText("Hola, ¿cuánto gasté este mes?")).toBeInTheDocument();
  });

  it("does not render assistant bubble for user messages", () => {
    const { container } = render(<MessageBubble role="user" content="hi" />);
    expect(container.querySelector(".justify-end")).toBeInTheDocument();
    expect(container.querySelector(".justify-start")).not.toBeInTheDocument();
  });
});

describe("MessageBubble — assistant", () => {
  it("renders text part content as markdown", () => {
    const parts: AssistantPart[] = [{ kind: "text", content: "**Total:** $950" }];
    render(<MessageBubble role="assistant" parts={parts} />);
    expect(screen.getByText("Total:")).toBeInTheDocument();
  });

  it("does not render empty text parts", () => {
    const parts: AssistantPart[] = [{ kind: "text", content: "" }];
    const { container } = render(<MessageBubble role="assistant" parts={parts} />);
    // No bubble divs rendered for empty text
    expect(container.querySelector(".justify-start")).not.toBeInTheDocument();
  });

  it("renders ToolCallBubble for tool_call parts", () => {
    const parts: AssistantPart[] = [
      { kind: "tool_call", toolCallId: "c1", name: "get_transactions", status: "done" },
    ];
    render(<MessageBubble role="assistant" parts={parts} />);
    expect(screen.getByText("Obteniendo transacciones")).toBeInTheDocument();
  });

  it("renders mixed text + tool_call parts in order", () => {
    const parts: AssistantPart[] = [
      { kind: "text", content: "Consultando datos..." },
      { kind: "tool_call", toolCallId: "c1", name: "get_transactions", status: "running" },
      { kind: "text", content: "Aquí está el resultado." },
    ];
    render(<MessageBubble role="assistant" parts={parts} />);
    expect(screen.getByText("Consultando datos...")).toBeInTheDocument();
    expect(screen.getByText("Obteniendo transacciones")).toBeInTheDocument();
    expect(screen.getByText("Aquí está el resultado.")).toBeInTheDocument();
  });

  it("shows streaming cursor on the last text part when isStreaming is true", () => {
    const parts: AssistantPart[] = [{ kind: "text", content: "Calculando..." }];
    const { container } = render(<MessageBubble role="assistant" parts={parts} isStreaming />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("does not show streaming cursor when isStreaming is false", () => {
    const parts: AssistantPart[] = [{ kind: "text", content: "Listo." }];
    const { container } = render(
      <MessageBubble role="assistant" parts={parts} isStreaming={false} />,
    );
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
  });

  it("does not show streaming cursor on non-last text parts", () => {
    const parts: AssistantPart[] = [
      { kind: "text", content: "First sentence." },
      { kind: "tool_call", toolCallId: "c1", name: "get_categories", status: "running" },
    ];
    const { container } = render(<MessageBubble role="assistant" parts={parts} isStreaming />);
    // Cursor only on last part; last part here is a tool_call, so no cursor
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
  });

  it("returns null gracefully when parts is empty", () => {
    const { container } = render(<MessageBubble role="assistant" parts={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
