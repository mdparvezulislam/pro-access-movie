import { z } from "zod";
import { MediaContentType, MediaFolder } from "@/types/media";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_SUBTITLE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
];

export const ALLOWED_SUBTITLE_TYPES = [
  "text/vtt",
  "application/x-subrip",
  "text/plain",
];

export const mediaFolderSchema = z.enum([
  "movie",
  "series",
  "people",
  "advertisements",
  "system",
  "users",
]);

export const mediaContentTypeSchema = z.enum([
  "poster",
  "backdrop",
  "banner",
  "thumbnail",
  "profile",
  "photo",
  "logo",
  "trailer",
  "subtitle",
  "ad_creative",
  "promo",
  "asset",
]);

export const uploadValidationSchema = z.object({
  originalName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  sizeBytes: z.number().positive("File size must be greater than 0"),
  folder: mediaFolderSchema,
  contentType: mediaContentTypeSchema,
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  durationSeconds: z.number().optional().nullable(),
  title: z.string().max(255).optional(),
  altText: z.string().max(500).optional(),
});

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateMediaUpload(params: {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  folder: MediaFolder;
  contentType: MediaContentType;
  width?: number | null;
  height?: number | null;
}): ValidationResult {
  const parseResult = uploadValidationSchema.safeParse(params);
  if (!parseResult.success) {
    return {
      valid: false,
      error: parseResult.error.issues?.[0]?.message || "Invalid upload metadata",
    };
  }

  const { mimeType, sizeBytes, contentType } = params;

  // Check Video limits
  if (contentType === "trailer" || mimeType.startsWith("video/")) {
    if (!ALLOWED_VIDEO_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `Unsupported video format (${mimeType}). Allowed: MP4, WebM`,
      };
    }
    if (sizeBytes > MAX_VIDEO_SIZE) {
      return {
        valid: false,
        error: `Video exceeds maximum size limit of 500MB (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB)`,
      };
    }
    return { valid: true };
  }

  // Check Subtitles
  if (contentType === "subtitle") {
    if (!ALLOWED_SUBTITLE_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `Unsupported subtitle format (${mimeType}). Allowed: VTT, SRT`,
      };
    }
    if (sizeBytes > MAX_SUBTITLE_SIZE) {
      return {
        valid: false,
        error: "Subtitle exceeds maximum size limit of 5MB",
      };
    }
    return { valid: true };
  }

  // Default Image validation
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported image format (${mimeType}). Allowed: JPEG, PNG, WebP, SVG, GIF`,
    };
  }

  if (sizeBytes > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image exceeds maximum size limit of 10MB (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }

  return { valid: true };
}
