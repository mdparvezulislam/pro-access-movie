"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Database, HardDrive, CheckCircle2, AlertTriangle, RefreshCw, Server, Film, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiagnosticData {
  status: "healthy" | "degraded";
  tables: Record<string, { status: "ok" | "error"; count?: number; error?: string }>;
  buckets: Record<string, { status: "ok" | "error"; error?: string }>;
  environment: Record<string, boolean>;
  timestamp: string;
}

export default function SystemHealthPage() {
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/diagnostics");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load health diagnostic data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/diagnostics")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load health diagnostic data");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-base border border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">System Health & Infrastructure Diagnostics</h1>
            <p className="text-xs text-text-muted">
              Real-time monitoring of Supabase PostgreSQL, Storage Buckets, TMDB API, and OpenRouter AI.
            </p>
          </div>
        </div>

        <Button
          onClick={fetchHealth}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2 text-xs border-border hover:bg-surface-raised"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Diagnostics
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Database Tables Card */}
          <div className="p-5 rounded-2xl bg-surface-base border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
                <Database className="h-4 w-4 text-cyan-400" />
                <span>PostgreSQL Database Tables</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised border border-border text-text-muted">
                Schema: public
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {Object.entries(data.tables).map(([table, result]) => (
                <div key={table} className="flex items-center justify-between p-2 rounded bg-surface-raised/40 border border-border/40">
                  <span className="text-text-secondary">{table}</span>
                  {result.status === "ok" ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-sans text-[11px] font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {result.count ?? 0} records
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 font-sans text-[11px] font-bold" title={result.error}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Missing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Storage Buckets Card */}
          <div className="p-5 rounded-2xl bg-surface-base border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
                <HardDrive className="h-4 w-4 text-purple-400" />
                <span>Supabase Storage Buckets</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised border border-border text-text-muted">
                Public Access
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {Object.entries(data.buckets).map(([bucket, result]) => (
                <div key={bucket} className="flex items-center justify-between p-2 rounded bg-surface-raised/40 border border-border/40">
                  <span className="text-text-secondary">{bucket}</span>
                  {result.status === "ok" ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-sans text-[11px] font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 font-sans text-[11px] font-bold" title={result.error}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Error
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* External Services & Environment Card */}
          <div className="p-5 rounded-2xl bg-surface-base border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
                <Server className="h-4 w-4 text-amber-400" />
                <span>Services & Keys</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised border border-border text-text-muted">
                Server Environment
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-surface-raised/40 border border-border/40">
                <span className="flex items-center gap-1.5 font-sans text-text-secondary">
                  <Film className="h-3.5 w-3.5 text-red-400" /> TMDB Provider
                </span>
                {data.environment.TMDB_API_KEY ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-sans text-[11px] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 font-sans text-[11px] font-bold">
                    <AlertTriangle className="h-3.5 w-3.5" /> Missing Key
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-raised/40 border border-border/40">
                <span className="flex items-center gap-1.5 font-sans text-text-secondary">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" /> OpenRouter Gateway
                </span>
                {data.environment.OPENROUTER_API_KEY ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-sans text-[11px] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-sans text-[11px] font-bold">
                    <AlertTriangle className="h-3.5 w-3.5" /> Optional Key
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-raised/40 border border-border/40">
                <span className="flex items-center gap-1.5 font-sans text-text-secondary">
                  <Database className="h-3.5 w-3.5 text-cyan-400" /> Service Role Key
                </span>
                {data.environment.SUPABASE_SERVICE_ROLE_KEY ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-sans text-[11px] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Server Privileged
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 font-sans text-[11px] font-bold">
                    <AlertTriangle className="h-3.5 w-3.5" /> Missing
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
