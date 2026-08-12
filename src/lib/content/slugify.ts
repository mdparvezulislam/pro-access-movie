import { createAdminClient } from "@/lib/supabase/server";

/**
 * Standardized slugify helper.
 * Handles English titles, Bengali characters, special characters, and trailing hyphens.
 */
export function slugifyText(text: string): string {
  if (!text) return "";

  let str = text.toLowerCase().trim();

  // Replace common Bengali special characters with basic Latin equivalents or spaces if un-slugifiable
  str = str
    .replace(/[^\w\s\u0980-\u09FF-]/g, "") // Keep alphanumeric, spaces, hyphens, and Bengali unicode range
    .replace(/\s+/g, "-") // Replace spaces with single hyphen
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens

  return str || "content";
}

/**
 * Generates a clean, unique slug for movies or series.
 * Appends release year if provided. If slug collision exists in database, appends incremental numeric suffix.
 */
export async function generateUniqueSlug(
  title: string,
  releaseYear?: number,
  contentType: "movie" | "series" = "movie",
  currentId?: string
): Promise<string> {
  const baseSlug = slugifyText(title);
  let candidateSlug = releaseYear ? `${baseSlug}-${releaseYear}` : baseSlug;

  try {
    const supabase = await createAdminClient();
    const table = contentType === "movie" ? "movies" : "series";

    let counter = 1;
    let isUnique = false;

    while (!isUnique && counter < 100) {
      let query = supabase.from(table).select("id").eq("slug", candidateSlug);
      if (currentId) {
        query = query.neq("id", currentId);
      }

      const { data } = await query.maybeSingle();

      if (!data) {
        isUnique = true;
      } else {
        counter++;
        candidateSlug = releaseYear
          ? `${baseSlug}-${releaseYear}-${counter}`
          : `${baseSlug}-${counter}`;
      }
    }
  } catch (err) {
    console.warn("Database slug uniqueness check fallback:", err);
  }

  return candidateSlug;
}
