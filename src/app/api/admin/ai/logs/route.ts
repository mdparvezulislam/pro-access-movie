import { NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";
import { AIUsageLogRecord, AIUsageAnalytics } from "@/types/ai";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("ai_usage_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      // Return empty analytics if database table is empty or unpopulated
      return NextResponse.json({
        totalOperations: 0,
        totalTokens: 0,
        avgLatencyMs: 0,
        modelBreakdown: {},
        operationBreakdown: {},
        recentLogs: [],
      });
    }

    const logs = (data || []) as AIUsageLogRecord[];
    const totalOperations = logs.length;
    const totalTokens = logs.reduce((sum, log) => sum + (log.total_tokens || 0), 0);
    const totalLatency = logs.reduce((sum, log) => sum + (log.latency_ms || 0), 0);
    const avgLatencyMs = totalOperations > 0 ? Math.round(totalLatency / totalOperations) : 0;

    const modelBreakdown: Record<string, number> = {};
    const operationBreakdown: Record<string, number> = {};

    for (const log of logs) {
      modelBreakdown[log.model] = (modelBreakdown[log.model] || 0) + 1;
      operationBreakdown[log.operation] = (operationBreakdown[log.operation] || 0) + 1;
    }

    const analytics: AIUsageAnalytics = {
      totalOperations,
      totalTokens,
      avgLatencyMs,
      modelBreakdown,
      operationBreakdown,
      recentLogs: logs,
    };

    return NextResponse.json(analytics);
  } catch (err: unknown) {
    console.error("Error fetching AI logs API:", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch AI usage analytics.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
