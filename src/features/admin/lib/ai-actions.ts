"use server";
import { generateAIDescription, generateAISeoMetadata } from "@/lib/ai/operations";
import { createServerClient } from "@/lib/supabase/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";

export async function generateMetadataAction(title: string) {
  const user = await getCurrentUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return { success: false, error: "Forbidden: Admin access required" };
  }

  try {
    const descResult = await generateAIDescription({ operation: "generate_description", title, targetLanguage: "bn" });
    const seoResult = await generateAISeoMetadata({ operation: "generate_seo", title, existingDescription: descResult.data.description });

    return {
      success: true,
      metadata: {
        titleBn: descResult.data.descriptionBn?.slice(0, 50) || `${title} (বাংলা)`,
        description: descResult.data.description,
        descriptionBn: descResult.data.descriptionBn,
        tagline: descResult.data.tagline || `Experience ${title}`,
        contentRating: "TV-MA",
        searchKeywords: seoResult.data.keywords.join(", "),
      },
    };
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
    const res = await generateAIDescription({ operation: "generate_description", title: text, targetLanguage: "bn" });
    return { success: true, translation: res.data.descriptionBn || text };
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
    const seoResult = await generateAISeoMetadata({ operation: "generate_seo", title: text });
    return { success: true, keywords: seoResult.data.keywords.join(", ") };
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
