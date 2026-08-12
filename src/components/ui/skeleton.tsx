import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-overlay/60 border border-border-muted/30",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
