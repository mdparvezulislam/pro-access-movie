import { env } from "@/lib/env";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * OpenRouter AI Gateway Skeleton (Phase 00 Foundation)
 * Encapsulates server-only OpenRouter API configuration and client payload builder.
 * Actual HTTP execution logic will be implemented in Phase 05.
 */
export class OpenRouterGateway {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    if (typeof window !== "undefined") {
      throw new Error("OpenRouterGateway is server-only and cannot be instantiated in the browser.");
    }
    this.apiKey = env.OPENROUTER_API_KEY || "";
    this.baseUrl = env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    this.defaultModel = env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";
  }

  public getModel(): string {
    return this.defaultModel;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Prepares execution payload header and parameters for OpenRouter request
   */
  public prepareRequestPayload(
    messages: OpenRouterMessage[],
    options?: OpenRouterCompletionOptions
  ) {
    return {
      url: `${this.baseUrl}/chat/completions`,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://flex-stream.bd",
        "X-Title": "FLEX Streaming Platform",
        "Content-Type": "application/json",
      },
      body: {
        model: options?.model || this.defaultModel,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
      },
    };
  }
}
