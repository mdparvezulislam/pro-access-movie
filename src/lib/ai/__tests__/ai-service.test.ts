import { describe, it, expect } from "vitest";
import {
  AIDescriptionOutputSchema,
  AISeoOutputSchema,
  AIClassificationOutputSchema,
} from "../schemas";
import {
  buildDescriptionPrompt,
  buildSeoPrompt,
} from "../prompts";
import {
  generateAIDescription,
  generateAISeoMetadata,
  suggestAIClassification,
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

  it("generates structured AI SEO metadata", async () => {
    const result = await generateAISeoMetadata({
      operation: "generate_seo",
      title: "Karagar",
      releaseYear: 2022,
    });

    expect(result.success).toBe(true);
    expect(result.data.seoTitle).toContain("Karagar");
    expect(result.data.keywords.length).toBeGreaterThan(0);
  });

  it("suggests AI classification ratings", async () => {
    const result = await suggestAIClassification({
      operation: "suggest_classification",
      title: "Breaking Bad",
    });

    expect(result.success).toBe(true);
    expect(result.data.suggestedGenres).toBeDefined();
  });
});
