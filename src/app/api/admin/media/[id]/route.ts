import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, checkIsAdmin } from "@/features/auth/lib/auth-helpers";
import {
  getMediaFileById,
  updateMediaMetadata,
  deleteMediaFile,
  replaceMediaFile,
  getSignedMediaUrl,
  getPublicMediaUrl,
} from "@/lib/media/storage";
import { FlexBucket, MediaContentType, MediaFolder, AccessStrategy } from "@/types/media";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const record = await getMediaFileById(id);

    if (!record) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 });
    }

    let url = record.public_url || getPublicMediaUrl(record.path, record.bucket);
    if (record.access_strategy === "signed") {
      url = await getSignedMediaUrl(
        record.path,
        record.bucket as FlexBucket,
        3600,
        record.content_type as MediaContentType
      );
    }

    return NextResponse.json({ record, url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch media file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privilege required" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const record = await updateMediaMetadata(id, {
      title: body.title,
      altText: body.altText,
      folder: body.folder as MediaFolder,
      contentType: body.contentType as MediaContentType,
      status: body.status,
      accessStrategy: body.accessStrategy as AccessStrategy,
    });

    if (!record) {
      return NextResponse.json({ error: "Failed to update media file" }, { status: 400 });
    }

    return NextResponse.json({ success: true, record });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update media file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privilege required" }, { status: 403 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

    const success = await deleteMediaFile(id, hardDelete);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete media file" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete media file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privilege required" }, { status: 403 });
    }

    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No replacement file provided" }, { status: 400 });
    }

    const width = formData.get("width") ? parseInt(formData.get("width") as string, 10) : undefined;
    const height = formData.get("height") ? parseInt(formData.get("height") as string, 10) : undefined;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const record = await replaceMediaFile(
      id,
      buffer,
      file.name,
      file.type,
      file.size,
      { width, height }
    );

    if (!record) {
      return NextResponse.json({ error: "File replacement failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, record });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to replace media file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
