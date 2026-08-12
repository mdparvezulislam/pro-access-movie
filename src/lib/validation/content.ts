import { z } from "zod";

export const contentStateSchema = z.enum(["draft", "review", "published", "archived"]);

export const contentTypeSchema = z.enum(["movie", "series", "episode", "live_tv", "trailer"]);

export const contentItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleBn: z.string().optional(),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  descriptionBn: z.string().optional(),
  type: contentTypeSchema,
  state: contentStateSchema,
  genres: z.array(z.string()).min(1, "Select at least one genre"),
  posterUrl: z.string().url().optional().or(z.literal("")),
  backdropUrl: z.string().url().optional().or(z.literal("")),
  durationMinutes: z.number().int().positive().optional(),
  releaseYear: z.number().int().min(1900).max(2100).optional(),
  ratingAge: z.string().optional(),
  isExclusive: z.boolean().default(false),
  isTrending: z.boolean().default(false),
});

export type ContentItemInput = z.infer<typeof contentItemSchema>;
