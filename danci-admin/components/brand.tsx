import { BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  markClassName,
  variant = "dark",
}: {
  className?: string;
  markClassName?: string;
  variant?: "dark" | "light";
}) {
  const onInk = variant === "dark";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl",
          onInk ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-primary text-primary-foreground",
          markClassName
        )}
      >
        <BookOpenText className="size-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-heading text-xl font-semibold tracking-tight", onInk ? "text-sidebar-accent-foreground" : "text-foreground")}>
          词海
        </span>
        <span className={cn("text-[0.6rem] font-medium uppercase tracking-[0.28em]", onInk ? "text-sidebar-foreground/60" : "text-muted-foreground")}>
          Console
        </span>
      </span>
    </div>
  );
}