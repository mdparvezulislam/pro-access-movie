import { ReactNode } from "react";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = <Film className="h-10 w-10 text-text-muted" />,
  actionLabel,
  onAction,
  actionHref,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-surface-base/50 space-y-4 ${className}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised border border-border">
        {icon}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-lg font-bold text-text-primary">{title}</h3>
        {description && (
          <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
        )}
      </div>

      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Button variant="outline" asChild size="sm">
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
