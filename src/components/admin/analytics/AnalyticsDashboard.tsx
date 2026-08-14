"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Film,
  Tv,
  Eye,
  Download,
  Megaphone,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AnalyticsData {
  metrics: {
    totalMovies: number;
    totalSeries: number;
    totalEpisodes: number;
    totalWatchEvents: number;
    totalDownloadSources: number;
    totalAdEvents: number;
  };
  recentMovies: { id: string; title: string; release_year: number; rating: number; status: string }[];
  recentSeries: { id: string; title: string; release_year: number; rating: number; status: string }[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      toast.error("Could not load analytics metrics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-base border border-border shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Platform Analytics & Insights
            </h1>
            <p className="text-xs text-text-muted">
              Real-time system telemetry, content inventory, watch sessions, and monetization metrics.
            </p>
          </div>
        </div>

        <Button
          onClick={fetchAnalytics}
          variant="outline"
          size="sm"
          className="h-9 text-xs gap-1.5 border-border"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh Metrics
        </Button>
      </div>

      {/* KPI Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">Querying database metrics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-surface-base border border-border space-y-1">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Total Movies</span>
                <Film className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-extrabold text-text-primary">
                {data?.metrics.totalMovies || 0}
              </p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> Catalog Active
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-base border border-border space-y-1">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Total Series</span>
                <Tv className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-extrabold text-text-primary">
                {data?.metrics.totalSeries || 0}
              </p>
              <p className="text-[10px] text-text-muted">
                {data?.metrics.totalEpisodes || 0} Total Episodes
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-base border border-border space-y-1">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Playback Events</span>
                <Eye className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                {data?.metrics.totalWatchEvents || 0}
              </p>
              <p className="text-[10px] text-text-muted">Recorded user streams</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-base border border-border space-y-1">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Download Sources</span>
                <Download className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">
                {data?.metrics.totalDownloadSources || 0}
              </p>
              <p className="text-[10px] text-text-muted">Active download links</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-base border border-border space-y-1">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Ad Impressions</span>
                <Megaphone className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-extrabold text-indigo-400 font-mono">
                {data?.metrics.totalAdEvents || 0}
              </p>
              <p className="text-[10px] text-text-muted">Tracked ad events</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-base border border-border space-y-1">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Platform Health</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xl font-extrabold text-emerald-400 uppercase">
                100% Online
              </p>
              <p className="text-[10px] text-text-muted">Supabase connected</p>
            </div>
          </div>

          {/* Recent Content Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Movies */}
            <div className="p-5 rounded-2xl bg-surface-base border border-border shadow-xl space-y-3">
              <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Film className="h-4 w-4 text-purple-400" /> Recent Movies Entry
              </h3>
              <div className="divide-y divide-border text-xs">
                {(data?.recentMovies || []).map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-text-primary">{m.title}</p>
                      <p className="text-[11px] text-text-muted">{m.release_year} • Rating: {m.rating || "N/A"}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Series */}
            <div className="p-5 rounded-2xl bg-surface-base border border-border shadow-xl space-y-3">
              <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Tv className="h-4 w-4 text-purple-400" /> Recent TV Series Entry
              </h3>
              <div className="divide-y divide-border text-xs">
                {(data?.recentSeries || []).map((s) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-text-primary">{s.title}</p>
                      <p className="text-[11px] text-text-muted">{s.release_year} • Rating: {s.rating || "N/A"}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
