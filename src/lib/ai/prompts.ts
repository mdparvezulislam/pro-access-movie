import { TargetLanguage } from "@/types/ai";

export const SYSTEM_PROMPT_BASE = `
You are the AI Content Intelligence Engine for "PRO ACCESS MOVIE", a premium video streaming platform targeting Bangladeshi and global audiences.
Your task is to enrich movie and TV series metadata with high literary quality, accurate categorization, and compelling localized summaries.

CRITICAL RULES:
1. Always output strictly valid JSON matching the requested JSON Schema without markdown formatting, triple backticks, or extra conversational text.
2. For Bengali (বাংলা) output: Write natural, fluent, human-sounding Bengali (avoiding robotic word-for-word translation). Use clear, authentic expressions suitable for movie enthusiasts in Bangladesh.
3. For Banglish output: Write Romanized Bengali as commonly spoken in casual conversations in Bangladesh.
4. Never invent factual errors or hallucinate false plot details if source details are sparse. Keep summaries engaging yet faithful to known synopsis.
`.trim();

export function buildDescriptionPrompt(
  title: string,
  releaseYear?: number,
  existingOverview?: string,
  genres?: string[],
  language: TargetLanguage = "bn",
  customInstructions?: string
): { systemPrompt: string; userPrompt: string } {
  const userPrompt = `
Generate a comprehensive, engaging movie/series summary for "${title}" ${releaseYear ? `(${releaseYear})` : ""}.

Context Information:
- Title: ${title}
- Existing Plot/Overview: ${existingOverview || "N/A"}
- Genres: ${genres?.join(", ") || "N/A"}
- Primary Language Target: ${language === "bn" ? "Bengali (বাংলা)" : language === "banglish" ? "Banglish" : "English"}
${customInstructions ? `- Custom Instructions: ${customInstructions}` : ""}

Required Output JSON Schema fields:
{
  "shortDescription": "Concise 1-2 sentence overview (English)",
  "description": "Full rich engaging synopsis (English)",
  "descriptionBn": "Natural fluent human Bengali synopsis (বাংলা)",
  "descriptionBanglish": "Romanized Banglish plot summary (optional)",
  "tagline": "Catchy promotional tagline"
}
`.trim();

  return {
    systemPrompt: SYSTEM_PROMPT_BASE,
    userPrompt,
  };
}

export function buildSeoPrompt(
  title: string,
  overview?: string,
  genres?: string[],
  releaseYear?: number
): { systemPrompt: string; userPrompt: string } {
  const userPrompt = `
Generate optimized SEO metadata and search keywords for "${title}" ${releaseYear ? `(${releaseYear})` : ""}.

Context Information:
- Title: ${title}
- Overview: ${overview || "N/A"}
- Genres: ${genres?.join(", ") || "N/A"}

Required Output JSON Schema fields:
{
  "seoTitle": "Optimized meta title under 60 chars",
  "seoDescription": "Engaging meta description under 155 chars",
  "keywords": ["5-10 SEO keywords English & Bengali"],
  "searchKeywords": ["10-15 search keywords & misspellings"],
  "aliases": ["Common alternative titles or Bengali transliterations"]
}
`.trim();

  return {
    systemPrompt: SYSTEM_PROMPT_BASE,
    userPrompt,
  };
}

export function buildClassificationPrompt(
  title: string,
  overview?: string,
  existingGenres?: string[]
): { systemPrompt: string; userPrompt: string } {
  const userPrompt = `
Analyze and classify content for "${title}".

Context:
- Title: ${title}
- Overview: ${overview || "N/A"}
- Existing Genres: ${existingGenres?.join(", ") || "N/A"}

Required Output JSON Schema fields:
{
  "suggestedGenres": ["Primary genres e.g. Action, Drama, Thriller, Romance, Sci-Fi"],
  "suggestedCategories": ["Platform categories e.g. Featured, Trending, Bengali Cinema, Blockbusters, Web Series"],
  "contentRating": "G" | "PG" | "13+" | "16+" | "18+",
  "ageRatingReason": "Brief explanation for age rating"
}
`.trim();

  return {
    systemPrompt: SYSTEM_PROMPT_BASE,
    userPrompt,
  };
}

export function buildEnhanceTextPrompt(
  text: string,
  instructions?: string
): { systemPrompt: string; userPrompt: string } {
  const userPrompt = `
Enhance and refine the following text for publication on PRO ACCESS MOVIE.

Input Text:
"""
${text}
"""
${instructions ? `Instructions: ${instructions}` : ""}

Required Output JSON Schema fields:
{
  "enhancedText": "Improved, polished, grammatically flawless version",
  "summary": "1 sentence brief summary of the text",
  "keyHighlights": ["3-5 bullet highlights"]
}
`.trim();

  return {
    systemPrompt: SYSTEM_PROMPT_BASE,
    userPrompt,
  };
}
