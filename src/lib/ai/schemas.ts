import { z } from "zod";

export const AIDescriptionOutputSchema = z.object({
  shortDescription: z.string().min(10).max(300),
  description: z.string().min(20).max(2500),
  descriptionBn: z.string().min(20).max(2500),
  descriptionBanglish: z.string().optional().default(""),
  tagline: z.string().optional().default(""),
});

export const AISeoOutputSchema = z.object({
  seoTitle: z.string().min(5).max(70),
  seoDescription: z.string().min(10).max(160),
  keywords: z.array(z.string()).min(1).max(20),
  searchKeywords: z.array(z.string()).min(1).max(20),
  aliases: z.array(z.string()).optional().default([]),
});

export const AIClassificationOutputSchema = z.object({
  suggestedGenres: z.array(z.string()).min(1).max(10),
  suggestedCategories: z.array(z.string()).min(1).max(10),
  contentRating: z.enum(["G", "PG", "13+", "16+", "18+"]).default("13+"),
  ageRatingReason: z.string().optional().default(""),
});

export const AIEnhanceTextOutputSchema = z.object({
  enhancedText: z.string().min(10),
  summary: z.string().optional().default(""),
  keyHighlights: z.array(z.string()).optional().default([]),
});
