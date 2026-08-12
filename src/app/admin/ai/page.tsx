import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Bot } from "lucide-react";

export default async function AdminAIPage() {
  await requireAdminAuth("/admin/ai");

  return (
    <AdminPageShell
      title="AI Enrichment Studio"
      description="Central OpenRouter AI portal for automated Bengali localization, SEO metadata generation, and content classification."
      icon={Bot}
      actionLabel="Run AI Batch Jobs"
    />
  );
}
