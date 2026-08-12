"use client";

import React, { useEffect, useState } from "react";
import {
  Bot,
  Zap,
  Activity,
  RefreshCw,
  Cpu,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIUsageAnalytics } from "@/types/ai";

export function AIStudioOverview() {
  const [analytics, setAnalytics] = useState<AIUsageAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/ai/logs");
      const data = await res.json();
      if (res.ok) {
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch AI logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/ai/logs");
        const data = await res.json();
        if (isMounted && res.ok) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Failed to fetch AI logs:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-surface-base to-surface-base border border-purple-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/20 text-purple-400 border border-purple-500/30 uppercase tracking-wide">
              Phase 05
            </span>
            <span className="text-xs text-text-muted">OpenRouter AI Gateway</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            AI Content Intelligence Studio
          </h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Monitor OpenRouter model performance, token usage analytics, latency metrics, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5 border-border"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Analytics
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface-base border border-border space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total AI Operations</span>
            <Zap className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-text-primary font-mono">
            {analytics?.totalOperations ?? 0}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-surface-base border border-border space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Tokens Consumed</span>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-text-primary font-mono">
            {analytics?.totalTokens ? analytics.totalTokens.toLocaleString() : 0}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-surface-base border border-border space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Average Latency</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-text-primary font-mono">
            {analytics?.avgLatencyMs ?? 0} <span className="text-xs text-text-muted font-sans">ms</span>
          </p>
        </div>

        <div className="p-5 rounded-xl bg-surface-base border border-border space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">AI Engine Model</span>
            <Bot className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xs font-bold text-text-primary truncate">
            OpenRouter / Gemini 2.5
          </p>
        </div>
      </div>

      {/* Usage Logs Table */}
      <div className="rounded-xl bg-surface-base border border-border overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-text-primary">AI Operation Audit Logs</h3>
          </div>
          <span className="text-xs text-text-muted font-mono">
            Showing last 100 requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-raised/60 text-text-muted font-bold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="p-3">Operation</th>
                <th className="p-3">Model</th>
                <th className="p-3">Tokens</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-text-muted">
                    Loading AI usage logs...
                  </td>
                </tr>
              ) : !analytics || analytics.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-text-muted">
                    No AI operation logs recorded yet. Trigger AI assistance from Content Studio!
                  </td>
                </tr>
              ) : (
                analytics.recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="p-3 font-semibold text-text-primary capitalize">
                      {log.operation.replace("_", " ")}
                    </td>
                    <td className="p-3 text-text-muted font-mono text-[11px] truncate max-w-[150px]">
                      {log.model}
                    </td>
                    <td className="p-3 font-mono text-purple-400 font-bold">
                      {log.total_tokens}
                    </td>
                    <td className="p-3 font-mono text-text-secondary">
                      {log.latency_ms} ms
                    </td>
                    <td className="p-3">
                      {log.status === "success" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Success
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right text-text-muted font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
