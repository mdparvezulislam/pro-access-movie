import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/common/loading-state";

interface AdminPageShellProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function AdminPageShell({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  children,
}: AdminPageShellProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10 text-red-500 border border-red-500/20">
              <Icon className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">{title}</h1>
          </div>
          <p className="text-xs text-text-secondary">{description}</p>
        </div>

        {actionLabel && (
          <Button variant="cinematic" size="sm" onClick={onAction} className="gap-2 text-xs">
            <span>{actionLabel}</span>
          </Button>
        )}
      </div>

      {/* Main Content Body */}
      {children ? (
        children
      ) : (
        <Card className="bg-surface-base border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-text-primary">{title} Management Console</CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Foundation shell ready for database entity management in Phase 02.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <LoadingState
              variant="skeleton-grid"
              message={`Loading ${title.toLowerCase()} records...`}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
