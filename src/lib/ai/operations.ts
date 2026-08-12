import "server-only";
import {
  AIRequestParams,
  AIResponsePayload,
  AIDescriptionOutput,
  AISeoOutput,
  AIClassificationOutput,
  AIEnhanceTextOutput,
} from "@/types/ai";
import {
  AIDescriptionOutputSchema,
  AISeoOutputSchema,
  AIClassificationOutputSchema,
  AIEnhanceTextOutputSchema,
} from "./schemas";
import {
  buildDescriptionPrompt,
  buildSeoPrompt,
  buildClassificationPrompt,
  buildEnhanceTextPrompt,
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
    shortDescription: `${params.title} is a popular cinematic presentation featuring an engaging storyline and high production quality.`,
    description: `Set against a dramatic backdrop, ${params.title} explores human emotion, suspense, and destiny. Rich characters navigate complex choices in this acclaimed film.`,
    descriptionBn: `${params.title} একটি চমৎকার চলচ্চিত্র যা দর্শককে মুগ্ধ করবে। এতে রয়েছে টানটান উত্তেজনা, আবেগ ও দারুণ অভিনয়।`,
    descriptionBanglish: `${params.title} ekta oshadharon movie, story r acting khub shundor.`,
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

export async function generateAISeoMetadata(
  params: AIRequestParams
): Promise<AIResponsePayload<AISeoOutput>> {
  const { systemPrompt, userPrompt } = buildSeoPrompt(
    params.title,
    params.existingDescription,
    params.genres,
    params.releaseYear
  );

  const fallbackData: AISeoOutput = {
    seoTitle: `Watch ${params.title} (${params.releaseYear || 2024}) Full Movie HD Online`,
    seoDescription: `Stream ${params.title} online on PRO ACCESS MOVIE. High definition streaming, full Bengali subtitles, and high quality audio.`,
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
    aliases: [params.title, `${params.title} (Movie)`],
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
    suggestedGenres: params.genres || ["Drama", "Thriller", "Action"],
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

export async function enhanceAIText(
  params: AIRequestParams
): Promise<AIResponsePayload<AIEnhanceTextOutput>> {
  const text = params.existingDescription || params.title;
  const { systemPrompt, userPrompt } = buildEnhanceTextPrompt(
    text,
    params.customInstructions
  );

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
