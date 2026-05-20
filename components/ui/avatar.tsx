import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const sizeClasses = sizeMap[size];

  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center",
        "bg-primary/15 border border-primary/20 transition-all duration-200",
        "hover:ring-1 hover:ring-primary/30",
        sizeClasses,
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? name ?? "avatar"} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-primary select-none">
          {name ? getInitials(name) : "?"}
        </span>
      )}
    </div>
  );
}

export { Avatar };
