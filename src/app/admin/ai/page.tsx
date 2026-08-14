import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AIEnrichmentManager } from "@/components/admin/ai/AIEnrichmentManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Enrichment Hub | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminAIPage() {
  await requireAdminAuth("/admin/ai");

  return <AIEnrichmentManager />;
}
