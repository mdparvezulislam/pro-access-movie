import React from "react";
import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Megaphone, Eye, MousePointerClick, TrendingUp, Layers } from "lucide-react";
import { AdvertisementsStudioClient } from "@/components/admin/ads/AdvertisementsStudioClient";

export default async function AdminAdvertisementsPage() {
  await requireAdminAuth("/admin/advertisements");

  const supabase = await createAdminClient();

  // Fetch ad creatives, placements, and event analytics
  const [creativesRes, placementsRes, eventsRes] = await Promise.all([
    supabase.from("ad_creatives").select("*").order("created_at", { ascending: false }),
    supabase.from("ad_placements").select("*").order("created_at", { ascending: false }),
    supabase.from("ad_events").select("*").order("created_at", { ascending: false }).limit(100),
  ]);

  const creatives = creativesRes.data || [];
  const placements = placementsRes.data || [];
  const events = eventsRes.data || [];

  const totalImpressions = events.filter((e) => e.event_type === "adImpression").length;
  const totalClicks = events.filter((e) => e.event_type === "adClicked").length;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  return (
    <AdminPageShell
      title="Advertisements & Smart Engine Studio"
      description="Manage banner creatives, player overlays, placement rules, frequency caps, and real-time impression analytics."
      icon={Megaphone}
    >
      <div className="space-y-8">
        {/* Analytics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface-base border border-border flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Impressions</p>
              <h3 className="text-2xl font-black text-text-primary mt-1">{totalImpressions}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-base border border-border flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Clicks</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalClicks}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-base border border-border flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Avg CTR %</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{ctr}%</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-base border border-border flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Active Creatives</p>
              <h3 className="text-2xl font-black text-purple-400 mt-1">{creatives.length}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Interactive Studio Client */}
        <AdvertisementsStudioClient initialCreatives={creatives} initialPlacements={placements} />
      </div>
    </AdminPageShell>
  );
}
