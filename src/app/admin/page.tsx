import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Film, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Admin Dashboard
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Catalog lifecycle state machine monitoring & management
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-surface-base border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Published Movies
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-text-muted mt-1">
              Ready for public consumption
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-base border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-text-muted mt-1">
              Awaiting editorial approval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-base border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Draft Records
            </CardTitle>
            <Film className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-text-muted mt-1">
              Strictly hidden from public
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content State Lifecycle Placeholder */}
      <Card className="bg-surface-base border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <span>Content State Machine Rules</span>
          </CardTitle>
          <CardDescription className="text-xs text-text-secondary">
            Enforced lifecycle pipeline: draft → review → published → archived
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-text-secondary">
          <div className="p-3 rounded-lg bg-surface-raised border border-border-muted flex items-center justify-between">
            <div className="font-semibold text-white">1. Draft State</div>
            <div className="text-text-muted">Editable by creator; RLS blocks public query</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-raised border border-border-muted flex items-center justify-between">
            <div className="font-semibold text-white">2. Review State</div>
            <div className="text-text-muted">Locked for moderation review</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-raised border border-border-muted flex items-center justify-between">
            <div className="font-semibold text-white">3. Published State</div>
            <div className="text-text-muted">Publicly visible across catalog rows</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-raised border border-border-muted flex items-center justify-between">
            <div className="font-semibold text-white">4. Archived State</div>
            <div className="text-text-muted">Soft-deleted, retained for analytics</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
