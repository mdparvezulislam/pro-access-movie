import { Database } from "./supabase";

export type ContentStatus = Database["public"]["Tables"]["movies"]["Row"]["status"];
export type ContentState = ContentStatus; // Alias for Phase 00 compatibility

export type Genre = Database["public"]["Tables"]["genres"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Language = Database["public"]["Tables"]["languages"]["Row"];
export type Country = Database["public"]["Tables"]["countries"]["Row"];

export type Movie = Database["public"]["Tables"]["movies"]["Row"];
export type Series = Database["public"]["Tables"]["series"]["Row"];
export type Season = Database["public"]["Tables"]["seasons"]["Row"];
export type Episode = Database["public"]["Tables"]["episodes"]["Row"];

export type Person = Database["public"]["Tables"]["people"]["Row"];
export type CastMember = Database["public"]["Tables"]["cast"]["Row"] & { person?: Person };
export type CrewMember = Database["public"]["Tables"]["crew"]["Row"] & { person?: Person };
export type Collection = Database["public"]["Tables"]["collections"]["Row"];

export interface ContentItemSummary {
  id: string;
  title: string;
  titleBn: string | null;
  slug: string;
  type: "movie" | "series";
  status: ContentStatus;
  releaseYear: number | null;
  durationMinutes: number | null;
  rating: number | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  searchKeywords?: string | null;
  genres?: string[];
  categoryIds?: string[];
}

export type ContentItem = ContentItemSummary;

export interface ContentRailData {
  id: string;
  title: string;
  titleBn?: string;
  items: ContentItemSummary[];
}
