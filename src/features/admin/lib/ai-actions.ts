"use server";
import { z } from "zod";
import { openRouterGateway } from "@/lib/ai/openrouter";
import { createServerClient } from "@/lib/supabase/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";

const metadataSchema = z.object({
  titleBn: z.string(),
  description: z.string(),
  descriptionBn: z.string(),
  tagline: z.string(),
  contentRating: z.string(),
  searchKeywords: z.string(),
});

export async function generateMetadataAction(title: string) {
  const user = await getCurrentUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return { success: false, error: "Forbidden: Admin access required" };
  }

  const prompt = `You are a film & media metadata specialist for FLEX, a Bangladesh streaming platform.
Generate structured metadata for the movie/series title: "${title}".
Return strictly valid JSON matching this schema:
{
  "titleBn": "Bangla title translation",
  "description": "Engaging 2-3 sentence English synopsis",
  "descriptionBn": "Engaging 2-3 sentence Bengali synopsis",
  "tagline": "Short catchy tagline",
  "contentRating": "PG-13 / R / TV-MA",
  "searchKeywords": "comma separated english and banglish keywords"
}`;

  try {
    const rawResponse = await openRouterGateway.chatCompletion([
      { role: "system", content: "Output strictly JSON only." },
      { role: "user", content: prompt },
    ]);

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object returned by AI");
    }

    const parsed = metadataSchema.parse(JSON.parse(jsonMatch[0]));
    return { success: true, metadata: parsed };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI generation error";
    return { success: false, error: message };
  }
}

export async function translateToBengaliAction(text: string) {
  const user = await getCurrentUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return { success: false, error: "Forbidden: Admin access required" };
  }

  try {
    const translation = await openRouterGateway.chatCompletion([
      { role: "system", content: "Translate the input text into natural Bengali. Output only the Bengali text." },
      { role: "user", content: text },
    ]);

    return { success: true, translation: translation.trim() };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Translation error";
    return { success: false, error: message };
  }
}

export async function extractKeywordsAction(text: string) {
  const user = await getCurrentUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return { success: false, error: "Forbidden: Admin access required" };
  }

  try {
    const keywords = await openRouterGateway.chatCompletion([
      { role: "system", content: "Extract 8-12 comma-separated English and Banglish search keywords for movie catalog indexing. Output only the keywords." },
      { role: "user", content: text },
    ]);

    return { success: true, keywords: keywords.trim() };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Keyword extraction error";
    return { success: false, error: message };
  }
}

export async function detectDuplicatesAction(title: string) {
  const user = await getCurrentUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return { success: false, error: "Forbidden: Admin access required" };
  }

  const supabase = await createServerClient();
  const { data: movies } = await supabase
    .from("movies")
    .select("id, title, slug, status")
    .ilike("title", `%${title}%`);

  const { data: series } = await supabase
    .from("series")
    .select("id, title, slug, status")
    .ilike("title", `%${title}%`);

  const matches = [
    ...(movies || []).map((m) => ({ ...m, type: "movie" })),
    ...(series || []).map((s) => ({ ...s, type: "series" })),
  ];

  return { success: true, matches };
}
