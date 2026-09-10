import { cn } from "@/lib/utils";
import { SOLD_LABEL } from "@/lib/sold";

export function SoldBadge({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full bg-background/90 font-bold tracking-[0.16em] text-muted-foreground uppercase",
        size === "sm" ? "px-3 py-1 text-[10px]" : "px-5 py-2 text-sm",
        className
      )}
    >
      {SOLD_LABEL}
    </span>
  );
}
