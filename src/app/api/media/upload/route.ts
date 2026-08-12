import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, checkIsAdmin } from "@/features/auth/lib/auth-helpers";
import { uploadMediaFile, getSignedMediaUrl, FlexBucket, MediaContentType } from "@/lib/media/storage";

const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_TRAILER_MIMES = ["video/mp4", "video/webm"];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB
const MAX_TRAILER_SIZE = 500 * 1024 * 1024; // 500 MB

const uploadFormSchema = z.object({
  bucket: z.enum(["flex-posters", "flex-backdrops", "flex-people", "flex-trailers"]),
  mediaType: z.enum(["poster", "backdrop", "photo", "trailer"]),
  contentKind: z.enum(["movie", "series", "person"]),
  contentId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Admin Authentication Gate
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Sign in required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privilege required" }, { status: 403 });
    }

    // 2. Parse Multipart FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string;
    const mediaType = formData.get("mediaType") as string;
    const contentKind = formData.get("contentKind") as string;
    const contentId = formData.get("contentId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided in request body" }, { status: 400 });
    }

    const parsed = uploadFormSchema.safeParse({ bucket, mediaType, contentKind, contentId });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid upload parameters", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const mimeType = file.type;
    const sizeBytes = file.size;

    // 3. Enforce MIME and Size Limits
    if (parsed.data.mediaType === "trailer") {
      if (!ALLOWED_TRAILER_MIMES.includes(mimeType)) {
        return NextResponse.json(
          { error: `Invalid trailer format: ${mimeType}. Allowed formats: ${ALLOWED_TRAILER_MIMES.join(", ")}` },
          { status: 400 }
        );
      }
      if (sizeBytes > MAX_TRAILER_SIZE) {
        return NextResponse.json(
          { error: `Trailer file size exceeds maximum limit of 500 MB (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB)` },
          { status: 400 }
        );
      }
    } else {
      if (!ALLOWED_IMAGE_MIMES.includes(mimeType)) {
        return NextResponse.json(
          { error: `Invalid image format: ${mimeType}. Allowed formats: ${ALLOWED_IMAGE_MIMES.join(", ")}` },
          { status: 400 }
        );
      }
      if (sizeBytes > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image file size exceeds maximum limit of 8 MB (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB)` },
          { status: 400 }
        );
      }
    }

    // Convert file to ArrayBuffer Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Invoke Storage Service Upload
    const record = await uploadMediaFile(buffer, {
      bucket: parsed.data.bucket as FlexBucket,
      contentType: parsed.data.mediaType as MediaContentType,
      originalName: file.name,
      mimeType,
      sizeBytes,
      movieId: parsed.data.contentKind === "movie" ? parsed.data.contentId : undefined,
      seriesId: parsed.data.contentKind === "series" ? parsed.data.contentId : undefined,
      personId: parsed.data.contentKind === "person" ? parsed.data.contentId : undefined,
      userId: user.id,
    });

    // 5. Generate signed delivery URL
    const signedUrl = await getSignedMediaUrl(
      record.path,
      record.bucket as FlexBucket,
      3600,
      record.content_type as MediaContentType
    );

    return NextResponse.json({
      success: true,
      record,
      signedUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal media upload error";
    console.error("Error in POST /api/media/upload:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
