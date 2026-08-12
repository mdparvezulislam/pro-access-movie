/**
 * Content Lifecycle State Enum
 * draft -> review -> published -> archived
 * Public clients must NEVER read draft or archived content.
 */
export type ContentState = "draft" | "review" | "published" | "archived";

export type ContentType = "movie" | "series" | "episode" | "live_tv" | "trailer";

export type ContentGenre =
  | "action"
  | "drama"
  | "comedy"
  | "romance"
  | "thriller"
  | "horror"
  | "documentary"
  | "animation"
  | "bengali_classic"
  | "natok";

export interface ContentItem {
  id: string;
  title: string;
  titleBn?: string;
  slug: string;
  description: string;
  descriptionBn?: string;
  type: ContentType;
  state: ContentState;
  genres: ContentGenre[];
  posterUrl?: string;
  backdropUrl?: string;
  durationMinutes?: number;
  releaseYear?: number;
  ratingAge?: string;
  isExclusive?: boolean;
  isTrending?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentRailData {
  id: string;
  title: string;
  titleBn?: string;
  items: ContentItem[];
}
