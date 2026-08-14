import { TargetLanguage } from "@/types/ai";

export const SYSTEM_PROMPT_BASE = `
You are the AI Content Intelligence Engine for "PRO ACCESS MOVIE", a premium video streaming platform targeting Bangladeshi and global audiences.
Your task is to enrich movie, series, season, and episode metadata with high literary quality, accurate categorization, and compelling localized summaries.

CRITICAL RULES:
1. Always output strictly valid JSON matching the requested JSON Schema without markdown formatting, triple backticks, or extra conversational text.
2. For Bengali (বাংলা) output: Write natural, fluent, human-sounding Bengali (avoiding robotic word-for-word translation). Use clear, authentic expressions suitable for movie enthusiasts in Bangladesh.
3. For Banglish output: Write Romanized Bengali as commonly spoken in casual conversations in Bangladesh.
4. Never invent false plot details or hallucinate facts if source details are sparse. Preserve important factual metadata (character names, release year, director, plot points).
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

export function buildImproveDescriptionPrompt(
  title: string,
  existingDescription?: string,
  existingDescriptionBn?: string,
  customInstructions?: string
): { systemPrompt: string; userPrompt: string } {
  const userPrompt = `
Improve and refine the existing descriptions for "${title}". Clean awkward phrasing, fix grammar, enhance emotional impact, and harmonize English and Bengali synopses.

Existing English Description: ${existingDescription || "N/A"}
Existing Bengali Description: ${existingDescriptionBn || "N/A"}
${customInstructions ? `Instructions: ${customInstructions}` : ""}

Required Output JSON Schema fields:
{
  "shortDescription": "Improved concise 1-2 sentence overview (English)",
  "description": "Improved rich synopsis (English)",
  "descriptionBn": "Improved natural fluent Bengali synopsis (বাংলা)",
  "descriptionBanglish": "Improved Banglish summary (optional)",
  "tagline": "Refined tagline"
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
Generate optimized SEO metadata, slug suggestion, and search keywords for "${title}" ${releaseYear ? `(${releaseYear})` : ""}.

Context Information:
- Title: ${title}
- Overview: ${overview || "N/A"}
- Genres: ${genres?.join(", ") || "N/A"}

Required Output JSON Schema fields:
{
  "seoTitle": "Optimized meta title under 70 chars (e.g. Watch ${title} Full Movie Online HD)",
  "seoDescription": "Engaging meta description under 160 chars for search engines",
  "keywords": ["10-15 relevant SEO keywords English & Bengali"],
  "searchKeywords": ["10-15 internal search keywords, misspellings, Banglish variants"],
  "aliases": ["Alternative title spellings or transliterations"],
  "suggestedSlug": "SEO friendly URL slug (e.g. ${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")})"
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
  "suggestedGenres": ["Primary genres e.g. Action, Drama, Thriller, Romance, Sci-Fi, Crime, Mystery"],
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

export function buildCleanContentPrompt(
  text: string,
  instructions?: string
): { systemPrompt: string; userPrompt: string } {
  const userPrompt = `
Clean the following content for publication on PRO ACCESS MOVIE.
Clean awkward wording, duplicate text, formatting glitches, HTML residue, and unnecessary repetition.
Preserve all critical factual metadata (names, dates, places, plot facts).

Input Content:
"""
${text}
"""
${instructions ? `Specific Cleaning Request: ${instructions}` : ""}

Required Output JSON Schema fields:
{
  "cleanedText": "Cleaned, polished, flawless text without duplicate or repetitive wording",
  "improvementsMade": ["List of specific improvements made (e.g. Removed duplicate sentences, fixed Bengali grammar)"]
}
`.trim();

  return {
    systemPrompt: SYSTEM_PROMPT_BASE,
    userPrompt,
  };
}

export function buildTranslatePrompt(
  text: string,
  sourceLang: "en" | "bn" | "auto" = "auto",
  targetLang: "en" | "bn" = "bn"
): { systemPrompt: string; userPrompt: string } {
  const userPrompt = `
Translate the following text faithfully for a cinematic streaming platform.
Target Language: ${targetLang === "bn" ? "Bengali (বাংলা) - fluent, natural, human tone" : "English - cinematic, polished tone"}

Original Text:
"""
${text}
"""

Required Output JSON Schema fields:
{
  "translatedText": "Faithful, natural translation",
  "sourceLanguage": "${sourceLang}",
  "targetLanguage": "${targetLang}"
}
`.trim();

  return {
    systemPrompt: SYSTEM_PROMPT_BASE,
    userPrompt,
  };
}

export function buildEpisodeSummaryPrompt(
  seriesTitle: string,
  seasonNumber: number,
  episodeNumber: number,
  episodeTitle?: string,
  existingOverview?: string
): { systemPrompt: string; userPrompt: string } {
  const userPrompt = `
Generate a concise, spoiler-sensitive episode summary for "${seriesTitle}" - Season ${seasonNumber}, Episode ${episodeNumber}${episodeTitle ? `: "${episodeTitle}"` : ""}.

Existing Context: ${existingOverview || "N/A"}

Required Output JSON Schema fields:
{
  "shortSummary": "Concise 1-2 sentence non-spoiler overview",
  "fullSummary": "Detailed episode summary keeping major spoilers hidden",
  "keyEvents": ["2-4 major themes or non-spoiler highlights"]
}
`.trim();

  return {
    systemPrompt: SYSTEM_PROMPT_BASE,
    userPrompt,
  };
}

export function buildSeasonSummaryPrompt(
  seriesTitle: string,
  seasonNumber: number,
  existingOverview?: string
): { systemPrompt: string; userPrompt: string } {
  const userPrompt = `
Generate a season overview for "${seriesTitle}" - Season ${seasonNumber}.

Existing Context: ${existingOverview || "N/A"}

Required Output JSON Schema fields:
{
  "seasonOverview": "Engaging overview of Season ${seasonNumber}'s narrative arc and stakes",
  "keyArcs": ["2-4 key character or plot arcs"]
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
