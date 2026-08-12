import "server-only";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

export type MediaFileRecord = Database["public"]["Tables"]["media_files"]["Row"];

export type FlexBucket = "flex-posters" | "flex-backdrops" | "flex-people" | "flex-trailers";
export type MediaContentType = "poster" | "backdrop" | "photo" | "trailer";

export interface UploadMediaParams {
  bucket: FlexBucket;
  contentType: MediaContentType;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  movieId?: string;
  seriesId?: string;
  personId?: string;
  userId?: string;
}

const DEFAULT_PLACEHOLDERS: Record<MediaContentType, string> = {
  poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
  backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
  photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
  trailer: "",
};

/**
 * Generates a signed URL for a private storage object with placeholder fallback on error.
 */
export async function getSignedMediaUrl(
  path: string | null | undefined,
  bucket: FlexBucket,
  expirySeconds: number = 3600,
  fallbackType: MediaContentType = "poster"
): Promise<string> {
  if (!path) {
    return DEFAULT_PLACEHOLDERS[fallbackType] || "";
  }

  // If path is already a full external HTTP(S) URL (e.g. Unsplash or TMDB placeholder)
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
      return DEFAULT_PLACEHOLDERS[fallbackType] || "";
    }

    return data.signedUrl;
  } catch (err) {
    console.error(`Error in getSignedMediaUrl:`, err);
    return DEFAULT_PLACEHOLDERS[fallbackType] || "";
  }
}

/**
 * Lists active media files associated with a movie, series, or person.
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
 * Uploads a file to Supabase storage via service-role client and inserts record in media_files.
 */
export async function uploadMediaFile(
  fileBuffer: Buffer,
  params: UploadMediaParams
): Promise<MediaFileRecord> {
  const adminClient = await createAdminClient();

  const fileExt = params.originalName.split(".").pop() || "bin";
  const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
  const contentId = params.movieId || params.seriesId || params.personId || "unassigned";
  const storagePath = `${params.contentType}/${contentId}/${crypto.randomUUID()}.${cleanExt}`;

  // 1. Upload file object to private storage bucket
  const { error: uploadError } = await adminClient.storage
    .from(params.bucket)
    .upload(storagePath, fileBuffer, {
      contentType: params.mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // 2. Insert record into public.media_files
  const { data: record, error: dbError } = await adminClient
    .from("media_files")
    .insert({
      bucket: params.bucket,
      path: storagePath,
      original_name: params.originalName,
      mime_type: params.mimeType,
      size_bytes: params.sizeBytes,
      width: params.width ?? null,
      height: params.height ?? null,
      content_type: params.contentType,
      movie_id: params.movieId ?? null,
      series_id: params.seriesId ?? null,
      person_id: params.personId ?? null,
      status: "active",
      created_by: params.userId ?? null,
    })
    .select("*")
    .single();

  if (dbError) {
    throw new Error(`Media metadata record creation failed: ${dbError.message}`);
  }

  return record as MediaFileRecord;
}

/**
 * Soft-archives a media file record and deletes the underlying storage object.
 */
export async function archiveMediaFile(mediaId: string): Promise<boolean> {
  const adminClient = await createAdminClient();

  // Fetch record details
  const { data: record, error: fetchError } = await adminClient
    .from("media_files")
    .select("bucket, path")
    .eq("id", mediaId)
    .single();

  if (fetchError || !record) {
    return false;
  }

  // 1. Update status to archived
  await adminClient
    .from("media_files")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", mediaId);

  // 2. Delete file from storage bucket
  await adminClient.storage.from(record.bucket as FlexBucket).remove([record.path]);

  return true;
}
