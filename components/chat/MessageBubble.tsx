import ReactMarkdown from "react-markdown";
import { FileText } from "lucide-react";
import type { AssistantPart } from "@/types/chat";
import { ToolCallBubble } from "./ToolCallBubble";
import { formatDocumentSize } from "@/lib/document-attachments";

// ── Markdown renderer ─────────────────────────────────────────────────────────

const MD_COMPONENTS: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-on-surface">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ children }) => (
    <code className="bg-surface-container-high px-1.5 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-surface-container-high rounded-xl p-3 mb-2 overflow-x-auto text-xs font-mono">
      {children}
    </pre>
  ),
  h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-outline-variant pl-3 italic text-on-surface-variant mb-2">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-outline-variant/30 my-2" />,
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface UserBubbleProps {
  role: "user";
  content: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
  }>;
}

interface AssistantBubbleProps {
  role: "assistant";
  parts: AssistantPart[];
  isStreaming?: boolean;
}

type Props = UserBubbleProps | AssistantBubbleProps;

// ── Component ─────────────────────────────────────────────────────────────────

export function MessageBubble(props: Props) {
  if (props.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-sm text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-sm">
          {props.content && <div>{props.content}</div>}
          {props.attachments?.length ? (
            <div className="mt-3 space-y-1.5 whitespace-normal">
              {props.attachments.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="flex items-center gap-2 rounded-xl bg-white/15 px-2.5 py-2 text-xs"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="shrink-0 opacity-75">{formatDocumentSize(file.size)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // assistant — render parts in order
  const { parts, isStreaming } = props;

  // Guard: if parts is somehow undefined (e.g. old history format), render nothing
  if (!parts?.length) return null;

  // Separate tool calls from text parts so tool calls render inline at the
  // point where they appear, while the surrounding text bubble is preserved.
  return (
    <div className="space-y-0.5">
      {parts.map((part, idx) => {
        if (part.kind === "tool_call") {
          return <ToolCallBubble key={`${part.toolCallId}-${idx}`} part={part} />;
        }

        // Text part — only render if non-empty
        if (!part.content) return null;

        const isLastPart = idx === parts.length - 1;
        return (
          <div key={idx} className="flex justify-start">
            <div className="max-w-[80%] bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-foreground leading-relaxed">
              <ReactMarkdown components={MD_COMPONENTS}>{part.content}</ReactMarkdown>
              {isStreaming && isLastPart && (
                <span className="inline-block w-[2px] h-4 bg-primary ml-0.5 animate-pulse rounded-sm align-middle" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
