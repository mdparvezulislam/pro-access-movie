import "server-only";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { AIOperation, AIResponsePayload } from "@/types/ai";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

export interface CallOpenRouterParams<T> {
  operation: AIOperation;
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  userId?: string;
  contentId?: string;
  contentType?: "movie" | "series" | "episode";
  fallbackData?: T;
}

export async function callOpenRouter<T>({
  operation,
  systemPrompt,
  userPrompt,
  schema,
  userId,
  contentId,
  contentType,
  fallbackData,
}: CallOpenRouterParams<T>): Promise<AIResponsePayload<T>> {
  const startTime = Date.now();
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = DEFAULT_MODEL;

  // If no OpenRouter API key configured, use intelligent mock fallback
  if (!apiKey || apiKey.trim().length === 0 || apiKey.includes("placeholder")) {
    const latencyMs = Date.now() - startTime;
    if (!fallbackData) {
      throw new Error("OPENROUTER_API_KEY is not configured in server environment.");
    }

    await logAIUsage({
      userId,
      operation,
      model: `${model} (demo-fallback)`,
      contentId,
      contentType,
      status: "success",
      promptTokens: 120,
      completionTokens: 180,
      totalTokens: 300,
      latencyMs,
    });

    return {
      success: true,
      operation,
      model: `${model} (demo-fallback)`,
      data: fallbackData,
      usage: { promptTokens: 120, completionTokens: 180, totalTokens: 300 },
      latencyMs,
      isMockFallback: true,
    };
  }

  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://proaccessmovie.bd",
        "X-Title": "PRO ACCESS MOVIE AI Intelligence",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = `OpenRouter HTTP ${response.status}: ${response.statusText}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error?.message) errorMsg = errJson.error.message;
      } catch {}

      await logAIUsage({
        userId,
        operation,
        model,
        contentId,
        contentType,
        status: "failed",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        latencyMs,
        errorMessage: errorMsg,
      });

      if (fallbackData) {
        return {
          success: true,
          operation,
          model: `${model} (fallback)`,
          data: fallbackData,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          latencyMs,
          isMockFallback: true,
        };
      }

      throw new Error(errorMsg);
    }

    const payload = await response.json();
    const rawContent = payload.choices?.[0]?.message?.content || "";
    const promptTokens = payload.usage?.prompt_tokens || 0;
    const completionTokens = payload.usage?.completion_tokens || 0;
    const totalTokens = payload.usage?.total_tokens || promptTokens + completionTokens;

    // Clean potential markdown fencing ```json ... ```
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsedJson = JSON.parse(cleanJson);
    const validatedData = schema.parse(parsedJson);

    await logAIUsage({
      userId,
      operation,
      model,
      contentId,
      contentType,
      status: "success",
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
    });

    return {
      success: true,
      operation,
      model,
      data: validatedData,
      usage: { promptTokens, completionTokens, totalTokens },
      latencyMs,
      isMockFallback: false,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Failed to execute OpenRouter AI request.";

    await logAIUsage({
      userId,
      operation,
      model,
      contentId,
      contentType,
      status: "failed",
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs,
      errorMessage,
    });

    if (fallbackData) {
      return {
        success: true,
        operation,
        model: `${model} (fallback)`,
        data: fallbackData,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        latencyMs,
        isMockFallback: true,
      };
    }

    throw new Error(`AI Generation Failed: ${errorMessage}`);
  }
}

async function logAIUsage(params: {
  userId?: string;
  operation: AIOperation;
  model: string;
  contentId?: string;
  contentType?: "movie" | "series" | "episode";
  status: "success" | "failed";
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  errorMessage?: string;
}) {
  try {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, serviceKey);

    await supabase.from("ai_usage_logs").insert({
      user_id: params.userId || null,
      operation: params.operation,
      model: params.model,
      content_id: params.contentId || null,
      content_type: params.contentType || null,
      status: params.status,
      prompt_tokens: params.promptTokens,
      completion_tokens: params.completionTokens,
      total_tokens: params.totalTokens,
      latency_ms: params.latencyMs,
      error_message: params.errorMessage || null,
    });
  } catch (err) {
    console.warn("Notice: Failed to insert AI usage log:", err);
  }
}
