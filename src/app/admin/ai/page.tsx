import React from "react";
import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AIStudioOverview } from "@/components/admin/ai/AIStudioOverview";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Enrichment Studio | Admin | PRO ACCESS MOVIE",
  description: "OpenRouter AI Content Intelligence gateway, analytics, and usage logs.",
};

export default async function AdminAIPage() {
  await requireAdminAuth("/admin/ai");

  return (
    <div className="p-6 md:p-8">
      <AIStudioOverview />
    </div>
  );
}
