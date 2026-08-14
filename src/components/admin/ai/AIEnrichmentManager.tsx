"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bot,
  Sparkles,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Activity,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { toast } from "sonner";

interface AIUsageLog {
  id: string;
  operation: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface AIAnalyticsData {
  totalOperations: number;
  totalTokens: number;
  avgLatencyMs: number;
  modelBreakdown: Record<string, number>;
  operationBreakdown: Record<string, number>;
  recentLogs: AIUsageLog[];
}

export function AIEnrichmentManager() {
  const [analytics, setAnalytics] = useState<AIAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/ai/logs");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch AI logs:", err);
      toast.error("Could not load AI usage history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = (analytics?.recentLogs || []).filter((log) => {
    if (searchQuery.trim()) {
      return (
        log.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-base border border-border shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary flex items-center gap-2">
              OpenRouter AI Content Intelligence Hub
            </h1>
            <p className="text-xs text-text-muted">
              Central OpenRouter gateway, Zod schema validation, usage token analytics, and execution history.
            </p>
          </div>
        </div>

        <Button
          onClick={fetchLogs}
          variant="outline"
          size="sm"
          className="h-9 text-xs gap-1.5 border-border"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Refresh Activity
        </Button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-base border border-border space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold">Total AI Operations</span>
            <Activity className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-text-primary">
            {analytics?.totalOperations || 0}
          </p>
          <p className="text-[10px] text-text-muted">OpenRouter calls executed</p>
        </div>

        <div className="p-4 rounded-xl bg-surface-base border border-border space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold">Total Tokens Consumed</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 font-mono">
            {(analytics?.totalTokens || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-text-muted">Prompt + completion tokens</p>
        </div>

        <div className="p-4 rounded-xl bg-surface-base border border-border space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold">Average Latency</span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">
            {analytics?.avgLatencyMs || 0} ms
          </p>
          <p className="text-[10px] text-text-muted">Avg response time per request</p>
        </div>
      </div>

      {/* Interactive AI Playground */}
      <AIAssistantPanel title="Surongo" releaseYear={2023} contentType="movie" />

      {/* Usage History Log */}
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-surface-base border border-border flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            AI Execution History Logs
          </h3>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by operation or model..."
              className="pl-9 h-9 text-xs bg-surface-raised border-border"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading AI logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface-base border border-border text-xs text-text-muted">
            No AI execution logs recorded yet.
          </div>
        ) : (
          <div className="rounded-2xl bg-surface-base border border-border shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised/60 text-text-muted font-bold border-b border-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Tokens</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-text-muted text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-text-primary capitalize">
                      {log.operation.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 font-mono text-purple-300">
                      {log.model}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {log.total_tokens}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-muted">
                      {log.latency_ms} ms
                    </td>
                    <td className="py-3 px-4">
                      {log.status === "completed" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1 w-max">
                          <AlertCircle className="h-3 w-3" /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
