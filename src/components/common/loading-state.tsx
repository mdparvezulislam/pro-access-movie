import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  message?: string;
  className?: string;
  variant?: "spinner" | "skeleton-grid" | "hero-skeleton";
}

export function LoadingState({
  message = "Loading media...",
  className = "",
  variant = "spinner",
}: LoadingStateProps) {
  if (variant === "skeleton-grid") {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48 bg-surface-raised" />
          <Skeleton className="h-5 w-20 bg-surface-raised" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-xl bg-surface-raised" />
              <Skeleton className="h-4 w-3/4 bg-surface-raised" />
              <Skeleton className="h-3 w-1/2 bg-surface-raised" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "hero-skeleton") {
    return (
      <div className={`w-full aspect-[16/7] min-h-[360px] rounded-2xl bg-surface-raised p-8 flex flex-col justify-end gap-4 animate-pulse ${className}`}>
        <Skeleton className="h-6 w-32 bg-surface-overlay" />
        <Skeleton className="h-10 w-2/3 max-w-xl bg-surface-overlay" />
        <Skeleton className="h-4 w-1/2 max-w-md bg-surface-overlay" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-32 rounded-lg bg-surface-overlay" />
          <Skeleton className="h-11 w-32 rounded-lg bg-surface-overlay" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center space-y-4 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      <p className="text-sm font-medium text-text-secondary">{message}</p>
    </div>
  );
}
