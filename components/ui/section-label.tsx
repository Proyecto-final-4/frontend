import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  prefix?: string;
}

function SectionLabel({ children, className, prefix = "//" }: SectionLabelProps) {
  return (
    <p data-slot="section-label" className={cn("section-tag", className)}>
      {prefix && <span className="mr-1.5 opacity-50">{prefix}</span>}
      {children}
    </p>
  );
}

export { SectionLabel };
