export type AIOperation =
  | "generate_description"
  | "improve_description"
  | "generate_seo"
  | "suggest_classification"
  | "clean_content"
  | "translate"
  | "generate_episode_summary"
  | "generate_season_summary"
  | "localize_bengali"
  | "enhance_text";

export type TargetLanguage = "en" | "bn" | "banglish";

export interface AIRequestParams {
  operation: AIOperation;
  title: string;
  originalTitle?: string;
  releaseYear?: number;
  existingDescription?: string;
  existingDescriptionBn?: string;
  existingText?: string;
  genres?: string[];
  targetLanguage?: TargetLanguage;
  sourceLanguage?: "en" | "bn" | "auto";
  contentId?: string;
  contentType?: "movie" | "series" | "season" | "episode";
  seriesTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
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
  suggestedSlug?: string;
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

export interface AICleanContentOutput {
  cleanedText: string;
  improvementsMade: string[];
}

export interface AITranslationOutput {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface AIEpisodeSummaryOutput {
  shortSummary: string;
  fullSummary: string;
  keyEvents: string[];
}

export interface AISeasonSummaryOutput {
  seasonOverview: string;
  keyArcs: string[];
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
