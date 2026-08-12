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
    this.defaultModel = env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
  }

  public async chatCompletion(
    messages: OpenRouterMessage[],
    options?: OpenRouterCompletionOptions
  ): Promise<string> {
    if (!this.apiKey || this.apiKey.includes("placeholder")) {
      return JSON.stringify({
        titleBn: "ডেমো শিরোনাম",
        description: "Demo generated AI summary for streaming title.",
        descriptionBn: "স্ট্রিমিং কনটেন্টের জন্য ডেমো বাংলা সারাংশ।",
        tagline: "Unleash Bengali Cinema",
        contentRating: "TV-MA",
        searchKeywords: "hawa, surung, monpura, bangla, movie",
      });
    }

    const payload = this.prepareRequestPayload(messages, options);
    const res = await fetch(payload.url, {
      method: "POST",
      headers: payload.headers,
      body: JSON.stringify(payload.body),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

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

export const openRouterGateway = new OpenRouterGateway();
