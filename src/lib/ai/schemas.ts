import { z } from "zod";

export const AIDescriptionOutputSchema = z.object({
  shortDescription: z.string().min(5).max(400),
  description: z.string().min(10).max(3000),
  descriptionBn: z.string().min(10).max(3000),
  descriptionBanglish: z.string().optional().default(""),
  tagline: z.string().optional().default(""),
});

export const AISeoOutputSchema = z.object({
  seoTitle: z.string().min(5).max(100),
  seoDescription: z.string().min(10).max(250),
  keywords: z.array(z.string()).min(1).max(30),
  searchKeywords: z.array(z.string()).min(1).max(30),
  aliases: z.array(z.string()).optional().default([]),
  suggestedSlug: z.string().optional().default(""),
});

export const AIClassificationOutputSchema = z.object({
  suggestedGenres: z.array(z.string()).min(1).max(10),
  suggestedCategories: z.array(z.string()).min(1).max(10),
  contentRating: z.enum(["G", "PG", "13+", "16+", "18+"]).default("13+"),
  ageRatingReason: z.string().optional().default(""),
});

export const AIEnhanceTextOutputSchema = z.object({
  enhancedText: z.string().min(5),
  summary: z.string().optional().default(""),
  keyHighlights: z.array(z.string()).optional().default([]),
});

export const AICleanContentOutputSchema = z.object({
  cleanedText: z.string().min(5),
  improvementsMade: z.array(z.string()).optional().default([]),
});

export const AITranslationOutputSchema = z.object({
  translatedText: z.string().min(1),
  sourceLanguage: z.string().default("en"),
  targetLanguage: z.string().default("bn"),
});

export const AIEpisodeSummaryOutputSchema = z.object({
  shortSummary: z.string().min(5).max(400),
  fullSummary: z.string().min(10).max(2500),
  keyEvents: z.array(z.string()).optional().default([]),
});

export const AISeasonSummaryOutputSchema = z.object({
  seasonOverview: z.string().min(10).max(2500),
  keyArcs: z.array(z.string()).optional().default([]),
});
