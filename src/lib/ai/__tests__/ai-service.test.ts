import { describe, it, expect } from "vitest";
import {
  AIDescriptionOutputSchema,
  AISeoOutputSchema,
  AIClassificationOutputSchema,
  AICleanContentOutputSchema,
  AITranslationOutputSchema,
  AIEpisodeSummaryOutputSchema,
} from "../schemas";
import {
  buildDescriptionPrompt,
  buildSeoPrompt,
  buildTranslatePrompt,
  buildEpisodeSummaryPrompt,
} from "../prompts";
import {
  generateAIDescription,
  improveAIDescription,
  generateAISeoMetadata,
  suggestAIClassification,
  cleanAIText,
  translateAIText,
  generateAIEpisodeSummary,
  generateAISeasonSummary,
} from "../operations";

describe("Phase 05 — OpenRouter AI Zod Schemas", () => {
  it("validates structured AI description payload", () => {
    const validPayload = {
      shortDescription: "A great movie about life and choices.",
      description: "Full plot overview containing dramatic elements.",
      descriptionBn: "একটি চমৎকার বাংলা বর্ণনা।",
      descriptionBanglish: "Khub shundor movie.",
      tagline: "The truth awaits.",
    };

    const parsed = AIDescriptionOutputSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it("validates structured AI SEO metadata payload", () => {
    const validSeo = {
      seoTitle: "Surongo (2023) Full Movie Watch Online HD",
      seoDescription: "Stream Surongo online on PRO ACCESS MOVIE in high definition.",
      keywords: ["surongo", "surongo movie", "pro access movie"],
      searchKeywords: ["surongo hd", "surongo bangla"],
      aliases: ["Surongo (2023)"],
      suggestedSlug: "surongo-2023",
    };

    const parsed = AISeoOutputSchema.safeParse(validSeo);
    expect(parsed.success).toBe(true);
  });

  it("validates structured AI classification payload", () => {
    const validClass = {
      suggestedGenres: ["Crime", "Thriller"],
      suggestedCategories: ["Featured", "Bengali Cinema"],
      contentRating: "13+",
      ageRatingReason: "Mild action and suspense.",
    };

    const parsed = AIClassificationOutputSchema.safeParse(validClass);
    expect(parsed.success).toBe(true);
  });

  it("validates clean content payload", () => {
    const validClean = {
      cleanedText: "Cleaned plot summary text without repetition.",
      improvementsMade: ["Removed duplicate sentences"],
    };

    const parsed = AICleanContentOutputSchema.safeParse(validClean);
    expect(parsed.success).toBe(true);
  });

  it("validates translation payload", () => {
    const validTrans = {
      translatedText: "কারাগার একটি চমৎকার ওয়েব সিরিজ।",
      sourceLanguage: "en",
      targetLanguage: "bn",
    };

    const parsed = AITranslationOutputSchema.safeParse(validTrans);
    expect(parsed.success).toBe(true);
  });

  it("validates episode summary payload", () => {
    const validEp = {
      shortSummary: "Episode 1 begins in high suspense.",
      fullSummary: "A mysterious prisoner appears with unknown motives.",
      keyEvents: ["Prisoner arrival", "Interrogation"],
    };

    const parsed = AIEpisodeSummaryOutputSchema.safeParse(validEp);
    expect(parsed.success).toBe(true);
  });
});

describe("Phase 05 — AI Prompt Construction", () => {
  it("builds localized description prompt with system instructions", () => {
    const { systemPrompt, userPrompt } = buildDescriptionPrompt("Surongo", 2023, undefined, ["Crime"], "bn");
    expect(systemPrompt).toContain("PRO ACCESS MOVIE");
    expect(userPrompt).toContain("Surongo");
    expect(userPrompt).toContain("Bengali (বাংলা)");
  });

  it("builds SEO prompt with keyword targets", () => {
    const { userPrompt } = buildSeoPrompt("Hawa", "Plot summary", ["Mystery"], 2022);
    expect(userPrompt).toContain("Hawa");
    expect(userPrompt).toContain("seoTitle");
  });

  it("builds translation prompt", () => {
    const { userPrompt } = buildTranslatePrompt("A mystery in deep waters.", "en", "bn");
    expect(userPrompt).toContain("Bengali (বাংলা)");
  });

  it("builds episode summary prompt with series context", () => {
    const { userPrompt } = buildEpisodeSummaryPrompt("Karagar", 1, 1, "The Stranger");
    expect(userPrompt).toContain("Karagar");
    expect(userPrompt).toContain("Season 1");
    expect(userPrompt).toContain("Episode 1");
  });
});

describe("Phase 05 — AI Operations & Demo Fallback Mode", () => {
  it("generates structured AI description with fallback when API key unconfigured", async () => {
    const result = await generateAIDescription({
      operation: "generate_description",
      title: "Hawa",
      releaseYear: 2022,
      targetLanguage: "bn",
    });

    expect(result.success).toBe(true);
    expect(result.data.descriptionBn).toBeDefined();
    expect(result.data.descriptionBn.length).toBeGreaterThan(5);
  });

  it("improves existing description text", async () => {
    const result = await improveAIDescription({
      operation: "improve_description",
      title: "Hawa",
      existingDescription: "Hawa is a 2022 film.",
    });

    expect(result.success).toBe(true);
    expect(result.data.description).toBeDefined();
  });

  it("generates structured AI SEO metadata and slug", async () => {
    const result = await generateAISeoMetadata({
      operation: "generate_seo",
      title: "Karagar",
      releaseYear: 2022,
    });

    expect(result.success).toBe(true);
    expect(result.data.seoTitle).toContain("Karagar");
    expect(result.data.keywords.length).toBeGreaterThan(0);
    expect(result.data.suggestedSlug).toBe("karagar");
  });

  it("suggests AI classification ratings", async () => {
    const result = await suggestAIClassification({
      operation: "suggest_classification",
      title: "Breaking Bad",
    });

    expect(result.success).toBe(true);
    expect(result.data.suggestedGenres).toBeDefined();
  });

  it("cleans raw text content", async () => {
    const result = await cleanAIText({
      operation: "clean_content",
      title: "Surongo",
      existingText: "Surongo   is a movie..  Surongo is a movie.",
    });

    expect(result.success).toBe(true);
    expect(result.data.cleanedText).toBeDefined();
  });

  it("translates text safely", async () => {
    const result = await translateAIText({
      operation: "translate",
      title: "Surongo",
      existingText: "A thrilling heist story.",
      targetLanguage: "bn",
    });

    expect(result.success).toBe(true);
    expect(result.data.translatedText).toBeDefined();
  });

  it("generates episode summary tied to series/season", async () => {
    const result = await generateAIEpisodeSummary({
      operation: "generate_episode_summary",
      title: "The Stranger",
      seriesTitle: "Karagar",
      seasonNumber: 1,
      episodeNumber: 1,
    });

    expect(result.success).toBe(true);
    expect(result.data.shortSummary).toBeDefined();
  });

  it("generates season summary", async () => {
    const result = await generateAISeasonSummary({
      operation: "generate_season_summary",
      title: "Karagar Season 1",
      seriesTitle: "Karagar",
      seasonNumber: 1,
    });

    expect(result.success).toBe(true);
    expect(result.data.seasonOverview).toBeDefined();
  });
});
