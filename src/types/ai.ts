export type AIOperation =
  | "generate_description"
  | "localize_bengali"
  | "generate_seo"
  | "suggest_classification"
  | "enhance_text";

export type TargetLanguage = "en" | "bn" | "banglish";

export interface AIRequestParams {
  operation: AIOperation;
  title: string;
  originalTitle?: string;
  releaseYear?: number;
  existingDescription?: string;
  genres?: string[];
  targetLanguage?: TargetLanguage;
  contentId?: string;
  contentType?: "movie" | "series" | "episode";
  customInstructions?: string;
}

export interface AIDescriptionOutput {
  shortDescription: string;
  description: string;
  descriptionBn: string;
  descriptionBanglish?: string;
  tagline?: string;
}

export interface AISeoOutput {
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  searchKeywords: string[];
  aliases: string[];
}

export interface AIClassificationOutput {
  suggestedGenres: string[];
  suggestedCategories: string[];
  contentRating: "G" | "PG" | "13+" | "16+" | "18+";
  ageRatingReason?: string;
}

export interface AIEnhanceTextOutput {
  enhancedText: string;
  summary: string;
  keyHighlights: string[];
}

export interface AIResponsePayload<T = unknown> {
  success: boolean;
  operation: AIOperation;
  model: string;
  data: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  isMockFallback?: boolean;
}

export interface AIUsageLogRecord {
  id: string;
  user_id: string | null;
  operation: AIOperation;
  model: string;
  content_id: string | null;
  content_type: string | null;
  status: "success" | "failed";
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  error_message: string | null;
  created_at: string;
}

export interface AIUsageAnalytics {
  totalOperations: number;
  totalTokens: number;
  avgLatencyMs: number;
  modelBreakdown: Record<string, number>;
  operationBreakdown: Record<string, number>;
  recentLogs: AIUsageLogRecord[];
}
