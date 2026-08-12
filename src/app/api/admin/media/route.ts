import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, checkIsAdmin } from "@/features/auth/lib/auth-helpers";
import {
  listMediaFiles,
  uploadMediaFile,
  getSignedMediaUrl,
  getPublicMediaUrl,
} from "@/lib/media/storage";
import { FlexBucket, MediaContentType, MediaFolder, AccessStrategy } from "@/types/media";
import { validateMediaUpload } from "@/lib/media/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privilege required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const folder = (searchParams.get("folder") as MediaFolder | "all") || "all";
    const contentType = (searchParams.get("contentType") as MediaContentType | "all") || "all";
    const status = (searchParams.get("status") as "active" | "archived" | "all") || "active";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const sortBy = (searchParams.get("sortBy") as "created_at" | "title" | "size_bytes") || "created_at";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const movieId = searchParams.get("movieId") || undefined;
    const seriesId = searchParams.get("seriesId") || undefined;
    const personId = searchParams.get("personId") || undefined;

    const result = await listMediaFiles({
      search,
      folder,
      contentType,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
      movieId,
      seriesId,
      personId,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to list media files";
    console.error("Error in GET /api/admin/media:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privilege required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as MediaFolder) || "system";
    const contentType = (formData.get("contentType") as MediaContentType) || "asset";
    const title = (formData.get("title") as string) || undefined;
    const altText = (formData.get("altText") as string) || undefined;
    const accessStrategy = (formData.get("accessStrategy") as AccessStrategy) || "public";
    const movieId = (formData.get("movieId") as string) || undefined;
    const seriesId = (formData.get("seriesId") as string) || undefined;
    const personId = (formData.get("personId") as string) || undefined;
    
    // Map folder to bucket if bucket is not explicitly provided
    let bucket = (formData.get("bucket") as FlexBucket) || undefined;
    if (!bucket) {
      const bucketMap: Record<MediaFolder, FlexBucket> = {
        movie: "flex-movie",
        series: "flex-series",
        people: "flex-people",
        advertisements: "flex-advertisements",
        system: "flex-system",
        users: "flex-users",
      };
      bucket = bucketMap[folder] || "flex-system";
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const width = formData.get("width") ? parseInt(formData.get("width") as string, 10) : undefined;
    const height = formData.get("height") ? parseInt(formData.get("height") as string, 10) : undefined;
    const durationSeconds = formData.get("durationSeconds") ? parseFloat(formData.get("durationSeconds") as string) : undefined;

    const validation = validateMediaUpload({
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      folder,
      contentType,
      width,
      height,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const record = await uploadMediaFile(buffer, {
      bucket,
      contentType,
      folder,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      width,
      height,
      durationSeconds,
      title,
      altText,
      accessStrategy,
      movieId,
      seriesId,
      personId,
      userId: user.id,
    });

    let displayUrl = record.public_url || getPublicMediaUrl(record.path, record.bucket);
    if (accessStrategy === "signed") {
      displayUrl = await getSignedMediaUrl(record.path, record.bucket as FlexBucket, 3600, contentType);
    }

    return NextResponse.json({
      success: true,
      record,
      url: displayUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload media file";
    console.error("Error in POST /api/admin/media:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
