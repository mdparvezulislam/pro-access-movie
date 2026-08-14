import "server-only";
import {
  AIRequestParams,
  AIResponsePayload,
  AIDescriptionOutput,
  AISeoOutput,
  AIClassificationOutput,
  AIEnhanceTextOutput,
  AICleanContentOutput,
  AITranslationOutput,
  AIEpisodeSummaryOutput,
  AISeasonSummaryOutput,
} from "@/types/ai";
import {
  AIDescriptionOutputSchema,
  AISeoOutputSchema,
  AIClassificationOutputSchema,
  AIEnhanceTextOutputSchema,
  AICleanContentOutputSchema,
  AITranslationOutputSchema,
  AIEpisodeSummaryOutputSchema,
  AISeasonSummaryOutputSchema,
} from "./schemas";
import {
  buildDescriptionPrompt,
  buildImproveDescriptionPrompt,
  buildSeoPrompt,
  buildClassificationPrompt,
  buildEnhanceTextPrompt,
  buildCleanContentPrompt,
  buildTranslatePrompt,
  buildEpisodeSummaryPrompt,
  buildSeasonSummaryPrompt,
} from "./prompts";
import { callOpenRouter } from "./openrouter-service";

export async function generateAIDescription(
  params: AIRequestParams
): Promise<AIResponsePayload<AIDescriptionOutput>> {
  const { systemPrompt, userPrompt } = buildDescriptionPrompt(
    params.title,
    params.releaseYear,
    params.existingDescription,
    params.genres,
    params.targetLanguage || "bn",
    params.customInstructions
  );

  const fallbackData: AIDescriptionOutput = {
    shortDescription: `${params.title} is a cinematic presentation featuring an engaging storyline and high production quality.`,
    description: `Set against a dramatic backdrop, ${params.title} explores human emotion, suspense, and destiny. Rich characters navigate complex choices in this acclaimed title.`,
    descriptionBn: `${params.title} একটি চমৎকার চলচ্চিত্র যা দর্শককে মুগ্ধ করবে। এতে রয়েছে টানটান উত্তেজনা, আবেগ ও দারুণ অভিনয়।`,
    descriptionBanglish: `${params.title} ekta oshadharon title, story r acting khub shundor.`,
    tagline: `Experience the extraordinary journey of ${params.title}.`,
  };

  return callOpenRouter<AIDescriptionOutput>({
    operation: "generate_description",
    systemPrompt,
    userPrompt,
    schema: AIDescriptionOutputSchema,
    userId: undefined,
    contentId: params.contentId,
    contentType: params.contentType,
    fallbackData,
  });
}

export async function improveAIDescription(
  params: AIRequestParams
): Promise<AIResponsePayload<AIDescriptionOutput>> {
  const { systemPrompt, userPrompt } = buildImproveDescriptionPrompt(
    params.title,
    params.existingDescription,
    params.existingDescriptionBn,
    params.customInstructions
  );

  const fallbackData: AIDescriptionOutput = {
    shortDescription: (params.existingDescription || params.title).slice(0, 150),
    description: params.existingDescription || `${params.title} updated with polished prose.`,
    descriptionBn: params.existingDescriptionBn || `${params.title} এর বর্ণনা পরিমার্জিত করা হয়েছে।`,
    descriptionBanglish: `${params.title} simplified plot overview.`,
    tagline: `Watch ${params.title} on PRO ACCESS MOVIE.`,
  };

  return callOpenRouter<AIDescriptionOutput>({
    operation: "improve_description",
    systemPrompt,
    userPrompt,
    schema: AIDescriptionOutputSchema,
    userId: undefined,
    contentId: params.contentId,
    contentType: params.contentType,
    fallbackData,
  });
}

export async function generateAISeoMetadata(
  params: AIRequestParams
): Promise<AIResponsePayload<AISeoOutput>> {
  const { systemPrompt, userPrompt } = buildSeoPrompt(
    params.title,
    params.existingDescription,
    params.genres,
    params.releaseYear
  );

  const slug = params.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const fallbackData: AISeoOutput = {
    seoTitle: `Watch ${params.title} (${params.releaseYear || 2024}) Full HD Online`,
    seoDescription: `Stream ${params.title} online on PRO ACCESS MOVIE. High definition streaming, Bengali subtitles, and premium audio.`,
    keywords: [
      params.title.toLowerCase(),
      `${params.title.toLowerCase()} movie`,
      `${params.title.toLowerCase()} full movie`,
      `${params.title.toLowerCase()} watch online`,
      "pro access movie",
      "bengali movies",
    ],
    searchKeywords: [
      params.title.toLowerCase(),
      `${params.title.toLowerCase()} hd`,
      `${params.title.toLowerCase()} 1080p`,
      `${params.title.toLowerCase()} bangla`,
    ],
    aliases: [params.title, `${params.title} (Official)`],
    suggestedSlug: slug,
  };

  return callOpenRouter<AISeoOutput>({
    operation: "generate_seo",
    systemPrompt,
    userPrompt,
    schema: AISeoOutputSchema,
    userId: undefined,
    contentId: params.contentId,
    contentType: params.contentType,
    fallbackData,
  });
}

export async function suggestAIClassification(
  params: AIRequestParams
): Promise<AIResponsePayload<AIClassificationOutput>> {
  const { systemPrompt, userPrompt } = buildClassificationPrompt(
    params.title,
    params.existingDescription,
    params.genres
  );

  const fallbackData: AIClassificationOutput = {
    suggestedGenres: params.genres && params.genres.length > 0 ? params.genres : ["Drama", "Thriller", "Action"],
    suggestedCategories: ["Featured", "Trending", "Blockbusters"],
    contentRating: "13+",
    ageRatingReason: "Contains moderate suspense and mild action sequences suitable for teens and adults.",
  };

  return callOpenRouter<AIClassificationOutput>({
    operation: "suggest_classification",
    systemPrompt,
    userPrompt,
    schema: AIClassificationOutputSchema,
    userId: undefined,
    contentId: params.contentId,
    contentType: params.contentType,
    fallbackData,
  });
}

export async function cleanAIText(
  params: AIRequestParams
): Promise<AIResponsePayload<AICleanContentOutput>> {
  const rawText = params.existingText || params.existingDescription || params.title;
  const { systemPrompt, userPrompt } = buildCleanContentPrompt(rawText, params.customInstructions);

  const fallbackData: AICleanContentOutput = {
    cleanedText: rawText.replace(/\s+/g, " ").trim(),
    improvementsMade: ["Normalized whitespace", "Cleaned formatting residue"],
  };

  return callOpenRouter<AICleanContentOutput>({
    operation: "clean_content",
    systemPrompt,
    userPrompt,
    schema: AICleanContentOutputSchema,
    userId: undefined,
    contentId: params.contentId,
    contentType: params.contentType,
    fallbackData,
  });
}

export async function translateAIText(
  params: AIRequestParams
): Promise<AIResponsePayload<AITranslationOutput>> {
  const rawText = params.existingText || params.existingDescription || params.title;
  const sourceLang = params.sourceLanguage || "auto";
  const targetLang = params.targetLanguage === "en" ? "en" : "bn";
  const { systemPrompt, userPrompt } = buildTranslatePrompt(rawText, sourceLang, targetLang);

  const fallbackData: AITranslationOutput = {
    translatedText: targetLang === "bn"
      ? `${params.title} এর বিস্তারিত বিবরণ বাংলা ভাষায় উপস্থাপন করা হল।`
      : `Detailed synopsis for ${params.title} presented in English.`,
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
  };

  return callOpenRouter<AITranslationOutput>({
    operation: "translate",
    systemPrompt,
    userPrompt,
    schema: AITranslationOutputSchema,
    userId: undefined,
    contentId: params.contentId,
    contentType: params.contentType,
    fallbackData,
  });
}

export async function generateAIEpisodeSummary(
  params: AIRequestParams
): Promise<AIResponsePayload<AIEpisodeSummaryOutput>> {
  const { systemPrompt, userPrompt } = buildEpisodeSummaryPrompt(
    params.seriesTitle || params.title,
    params.seasonNumber || 1,
    params.episodeNumber || 1,
    params.title,
    params.existingDescription
  );

  const fallbackData: AIEpisodeSummaryOutput = {
    shortSummary: `Episode ${params.episodeNumber || 1} of ${params.seriesTitle || params.title}.`,
    fullSummary: `In this episode of ${params.seriesTitle || params.title}, key characters navigate pivotal decisions as narrative tension heightens.`,
    keyEvents: ["Plot development", "Character confrontation"],
  };

  return callOpenRouter<AIEpisodeSummaryOutput>({
    operation: "generate_episode_summary",
    systemPrompt,
    userPrompt,
    schema: AIEpisodeSummaryOutputSchema,
    userId: undefined,
    contentId: params.contentId,
    contentType: "episode",
    fallbackData,
  });
}

export async function generateAISeasonSummary(
  params: AIRequestParams
): Promise<AIResponsePayload<AISeasonSummaryOutput>> {
  const { systemPrompt, userPrompt } = buildSeasonSummaryPrompt(
    params.seriesTitle || params.title,
    params.seasonNumber || 1,
    params.existingDescription
  );

  const fallbackData: AISeasonSummaryOutput = {
    seasonOverview: `Season ${params.seasonNumber || 1} of ${params.seriesTitle || params.title} brings high stakes, character arcs, and dramatic climaxes.`,
    keyArcs: ["Character evolution", "Central mystery climax"],
  };

  return callOpenRouter<AISeasonSummaryOutput>({
    operation: "generate_season_summary",
    systemPrompt,
    userPrompt,
    schema: AISeasonSummaryOutputSchema,
    userId: undefined,
    contentId: params.contentId,
    contentType: "season",
    fallbackData,
  });
}

export async function enhanceAIText(
  params: AIRequestParams
): Promise<AIResponsePayload<AIEnhanceTextOutput>> {
  const text = params.existingDescription || params.title;
  const { systemPrompt, userPrompt } = buildEnhanceTextPrompt(text, params.customInstructions);

  const fallbackData: AIEnhanceTextOutput = {
    enhancedText: text.trim() + " Enhanced with polished prose for optimal readability.",
    summary: `Refined synopsis for ${params.title}.`,
    keyHighlights: ["Polished narrative flow", "Grammatically verified", "Engaging style"],
  };

  return callOpenRouter<AIEnhanceTextOutput>({
    operation: "enhance_text",
    systemPrompt,
    userPrompt,
    schema: AIEnhanceTextOutputSchema,
    userId: undefined,
    contentId: params.contentId,
    contentType: params.contentType,
    fallbackData,
  });
}
