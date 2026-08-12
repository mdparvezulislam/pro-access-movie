import "server-only";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import {
  FlexBucket,
  MediaContentType,
  MediaFolder,
  MediaFileRecord,
  UploadMediaParams,
  UpdateMediaParams,
  MediaFilterOptions,
  MediaListResult,
  ImageVariantOptions,
} from "@/types/media";
import { validateMediaUpload } from "./validation";

export type { FlexBucket, MediaContentType, MediaFolder, MediaFileRecord, UploadMediaParams };

import { getPublicMediaUrl, getOptimizedMediaProps, DEFAULT_PLACEHOLDERS } from "./utils";

export { getPublicMediaUrl, getOptimizedMediaProps, DEFAULT_PLACEHOLDERS };

/**
 * Generates a signed URL for a private storage object with placeholder fallback on error.
 */
export async function getSignedMediaUrl(
  path: string | null | undefined,
  bucket: FlexBucket = "flex-system",
  expirySeconds: number = 3600,
  fallbackType: MediaContentType = "poster"
): Promise<string> {
  if (!path) {
    return DEFAULT_PLACEHOLDERS[fallbackType] || DEFAULT_PLACEHOLDERS.asset;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expirySeconds);

    if (error || !data?.signedUrl) {
      console.warn(`Failed to create signed URL for path '${path}' in bucket '${bucket}':`, error?.message);
      return DEFAULT_PLACEHOLDERS[fallbackType] || DEFAULT_PLACEHOLDERS.asset;
    }

    return data.signedUrl;
  } catch (err) {
    console.error(`Error in getSignedMediaUrl:`, err);
    return DEFAULT_PLACEHOLDERS[fallbackType] || DEFAULT_PLACEHOLDERS.asset;
  }
}

/**
 * Lists media files for content (movie, series, person).
 */
export async function listMediaForContent(
  contentId: string,
  contentKind: "movie" | "series" | "person"
): Promise<MediaFileRecord[]> {
  if (!contentId) return [];

  const supabase = await createServerClient();
  let query = supabase.from("media_files").select("*").eq("status", "active");

  if (contentKind === "movie") {
    query = query.eq("movie_id", contentId);
  } else if (contentKind === "series") {
    query = query.eq("series_id", contentId);
  } else if (contentKind === "person") {
    query = query.eq("person_id", contentId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error(`Error listing media for ${contentKind} '${contentId}':`, error);
    return [];
  }

  return (data || []) as MediaFileRecord[];
}

/**
 * List media assets with search, folder/type filters, and pagination.
 */
export async function listMediaFiles(options: MediaFilterOptions = {}): Promise<MediaListResult> {
  const {
    search,
    folder = "all",
    contentType = "all",
    status = "active",
    page = 1,
    limit = 24,
    sortBy = "created_at",
    sortOrder = "desc",
    movieId,
    seriesId,
    personId,
  } = options;

  const supabase = await createServerClient();
  let query = supabase.from("media_files").select("*", { count: "exact" });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (folder !== "all") {
    query = query.eq("folder", folder);
  }

  if (contentType !== "all") {
    query = query.eq("content_type", contentType);
  }

  if (movieId) query = query.eq("movie_id", movieId);
  if (seriesId) query = query.eq("series_id", seriesId);
  if (personId) query = query.eq("person_id", personId);

  if (search && search.trim() !== "") {
    const term = search.trim();
    query = query.or(`title.ilike.%${term}%,original_name.ilike.%${term}%,alt_text.ilike.%${term}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error listing media files:", error);
    return { items: [], total: 0, page, limit, totalPages: 0 };
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    items: (data || []) as MediaFileRecord[],
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Retrieves a single media asset record by ID.
 */
export async function getMediaFileById(id: string): Promise<MediaFileRecord | null> {
  if (!id) return null;
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("media_files")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as MediaFileRecord;
}

/**
 * Uploads a file buffer to Supabase storage and creates database metadata record.
 */
export async function uploadMediaFile(
  fileBuffer: Buffer,
  params: UploadMediaParams
): Promise<MediaFileRecord> {
  const validation = validateMediaUpload(params);
  if (!validation.valid) {
    throw new Error(`Upload validation failed: ${validation.error}`);
  }

  const adminClient = await createAdminClient();

  const fileExt = params.originalName.split(".").pop() || "bin";
  const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
  const folder = params.folder || "system";
  const filename = `${crypto.randomUUID()}.${cleanExt}`;
  const storagePath = `${params.contentType}/${filename}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await adminClient.storage
    .from(params.bucket)
    .upload(storagePath, fileBuffer, {
      contentType: params.mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const publicUrl = getPublicMediaUrl(storagePath, params.bucket);
  const title = params.title || params.originalName.replace(/\.[^/.]+$/, "");

  // 2. Insert DB Metadata record
  const { data: record, error: dbError } = await adminClient
    .from("media_files")
    .insert({
      bucket: params.bucket,
      path: storagePath,
      filename,
      original_name: params.originalName,
      mime_type: params.mimeType,
      size_bytes: params.sizeBytes,
      width: params.width ?? null,
      height: params.height ?? null,
      duration_seconds: params.durationSeconds ?? null,
      content_type: params.contentType,
      folder,
      title,
      alt_text: params.altText ?? null,
      access_strategy: params.accessStrategy || "public",
      public_url: publicUrl,
      movie_id: params.movieId ?? null,
      series_id: params.seriesId ?? null,
      person_id: params.personId ?? null,
      status: "active",
      created_by: params.userId ?? null,
    })
    .select("*")
    .single();

  if (dbError) {
    // Cleanup orphaned storage object if DB insert fails
    await adminClient.storage.from(params.bucket).remove([storagePath]);
    throw new Error(`Media record insertion failed: ${dbError.message}`);
  }

  return record as MediaFileRecord;
}

/**
 * Updates metadata of a media asset.
 */
export async function updateMediaMetadata(
  id: string,
  updates: UpdateMediaParams
): Promise<MediaFileRecord | null> {
  const adminClient = await createAdminClient();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.altText !== undefined) payload.alt_text = updates.altText;
  if (updates.folder !== undefined) payload.folder = updates.folder;
  if (updates.contentType !== undefined) payload.content_type = updates.contentType;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.accessStrategy !== undefined) payload.access_strategy = updates.accessStrategy;

  const { data, error } = await adminClient
    .from("media_files")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Failed to update media metadata:", error);
    return null;
  }

  return data as MediaFileRecord;
}

/**
 * Replaces the storage binary and metadata for an existing media asset.
 */
export async function replaceMediaFile(
  id: string,
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  sizeBytes: number,
  dimensions?: { width?: number; height?: number }
): Promise<MediaFileRecord | null> {
  const existing = await getMediaFileById(id);
  if (!existing) {
    throw new Error("Asset not found");
  }

  const adminClient = await createAdminClient();

  // Upload new file binary to existing path
  const { error: uploadError } = await adminClient.storage
    .from(existing.bucket as FlexBucket)
    .upload(existing.path, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`File replacement failed: ${uploadError.message}`);
  }

  // Update record metadata
  const { data, error } = await adminClient
    .from("media_files")
    .update({
      original_name: originalName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      width: dimensions?.width ?? existing.width,
      height: dimensions?.height ?? existing.height,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating media file metadata after replacement:", error);
    return null;
  }

  return data as MediaFileRecord;
}

/**
 * Deletes or archives a media file record and its storage binary.
 */
export async function deleteMediaFile(id: string, hardDelete: boolean = false): Promise<boolean> {
  const adminClient = await createAdminClient();

  const { data: record, error: fetchError } = await adminClient
    .from("media_files")
    .select("bucket, path")
    .eq("id", id)
    .single();

  if (fetchError || !record) {
    return false;
  }

  if (hardDelete) {
    await adminClient.storage.from(record.bucket as FlexBucket).remove([record.path]);
    const { error: delErr } = await adminClient.from("media_files").delete().eq("id", id);
    return !delErr;
  } else {
    const { error: archErr } = await adminClient
      .from("media_files")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);
    
    // Also remove from storage
    await adminClient.storage.from(record.bucket as FlexBucket).remove([record.path]);
    return !archErr;
  }
}

/**
 * Alias for backward compatibility.
 */
export const archiveMediaFile = (id: string) => deleteMediaFile(id, false);


