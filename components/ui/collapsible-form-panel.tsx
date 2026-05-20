"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { shouldAnimate, springSoft } from "@/lib/animations";

export interface CollapsibleFormPanelProps {
  title: string;
  children: ReactNode;
  /** Abierto al montar. Por defecto cerrado. */
  defaultOpen?: boolean;
  description?: string;
  className?: string;
}

export function CollapsibleFormPanel({
  title,
  children,
  defaultOpen = false,
  description,
  className,
}: CollapsibleFormPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  const animate = shouldAnimate();
  const MotionDiv = motion.div;

  return (
    <section
      className={cn(
        "rounded-2xl border border-outline-variant/30 bg-card p-5 shadow-sm",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <span className="min-w-0">
          <span className="block text-base font-bold font-headline text-on-surface">{title}</span>
          {description ? (
            <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <MotionDiv
        id={contentId}
        role="region"
        aria-label={title}
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={animate ? springSoft : { duration: 0 }}
        className="overflow-hidden"
      >
        <div className="origin-top pt-4">{children}</div>
      </MotionDiv>
    </section>
  );
}
