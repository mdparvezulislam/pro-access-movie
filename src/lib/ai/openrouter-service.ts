import "server-only";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { AIOperation, AIResponsePayload } from "@/types/ai";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export interface CallOpenRouterParams<T> {
  operation: AIOperation;
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  userId?: string;
  contentId?: string;
  contentType?: "movie" | "series" | "season" | "episode";
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
  const apiKey = process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY;
  const configuredModel = process.env.OPENROUTER_MODEL || env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  // If no OpenRouter API key configured, use intelligent mock fallback safely
  if (!apiKey || apiKey.trim().length === 0 || apiKey.includes("placeholder")) {
    const latencyMs = Date.now() - startTime;
    if (!fallbackData) {
      throw new Error("OPENROUTER_API_KEY is not configured in server environment.");
    }

    await logAIUsage({
      userId,
      operation,
      model: `${configuredModel} (demo-fallback)`,
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
      model: `${configuredModel} (demo-fallback)`,
      data: fallbackData,
      usage: { promptTokens: 120, completionTokens: 180, totalTokens: 300 },
      latencyMs,
      isMockFallback: true,
    };
  }

  // Attempt API call with up to 1 automatic retry on JSON / rate-limit failure
  let lastErrorMsg = "";
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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
          model: configuredModel,
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

        lastErrorMsg = errorMsg;

        // If rate limited or server error, wait briefly before retrying attempt 2
        if (attempt < maxAttempts && (response.status === 429 || response.status >= 500)) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        await logAIUsage({
          userId,
          operation,
          model: configuredModel,
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
            model: `${configuredModel} (fallback)`,
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

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(cleanJson);
      } catch (parseErr) {
        if (attempt < maxAttempts) {
          lastErrorMsg = "Malformed JSON returned from AI model.";
          continue;
        }
        throw parseErr;
      }

      const validatedData = schema.parse(parsedJson);

      await logAIUsage({
        userId,
        operation,
        model: configuredModel,
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
        model: configuredModel,
        data: validatedData,
        usage: { promptTokens, completionTokens, totalTokens },
        latencyMs,
        isMockFallback: false,
      };
    } catch (err: unknown) {
      lastErrorMsg = err instanceof Error ? err.message : "Failed to execute OpenRouter AI request.";
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
    }
  }

  // All attempts failed
  const latencyMs = Date.now() - startTime;
  await logAIUsage({
    userId,
    operation,
    model: configuredModel,
    contentId,
    contentType,
    status: "failed",
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    latencyMs,
    errorMessage: lastErrorMsg,
  });

  if (fallbackData) {
    return {
      success: true,
      operation,
      model: `${configuredModel} (fallback)`,
      data: fallbackData,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs,
      isMockFallback: true,
    };
  }

  throw new Error(`AI Service is temporarily unavailable. (${lastErrorMsg})`);
}

async function logAIUsage(params: {
  userId?: string;
  operation: AIOperation;
  model: string;
  contentId?: string;
  contentType?: "movie" | "series" | "season" | "episode";
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
    if (!supabaseUrl || !serviceKey) return;
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
    console.warn("Notice: Failed to log AI usage:", err);
  }
}
