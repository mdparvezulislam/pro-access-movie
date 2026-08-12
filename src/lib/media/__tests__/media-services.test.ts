import { describe, it, expect, vi } from "vitest";
import { getSignedMediaUrl, getPublicMediaUrl, listMediaForContent, getOptimizedMediaProps } from "../storage";
import { validateMediaUpload } from "../validation";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    storage: {
      from: vi.fn().mockReturnValue({
        createSignedUrl: vi.fn().mockImplementation((path: string) => {
          if (path.includes("invalid")) {
            return Promise.resolve({ data: null, error: new Error("File not found") });
          }
          return Promise.resolve({
            data: { signedUrl: `https://supabase.co/storage/v1/object/sign/flex-posters/${path}?token=test` },
            error: null,
          });
        }),
      }),
    },
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "media-1",
            bucket: "flex-movie",
            path: "poster/movie-1/file.webp",
            original_name: "poster.webp",
            mime_type: "image/webp",
            size_bytes: 1024500,
            content_type: "poster",
            folder: "movie",
            status: "active",
            created_at: "2026-08-12T00:00:00Z",
          },
        ],
        count: 1,
        error: null,
      }),
    })),
  }),
  createAdminClient: vi.fn(),
}));

describe("Media Storage & Validation Service (Phase 03)", () => {
  it("returns signed URL for valid path", async () => {
    const url = await getSignedMediaUrl("posters/hawa.webp", "flex-posters");
    expect(url).toContain("https://supabase.co/storage");
    expect(url).toContain("token=test");
  });

  it("returns full external URL as-is when path is an HTTP string", async () => {
    const externalUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401";
    const url = await getSignedMediaUrl(externalUrl, "flex-posters");
    expect(url).toBe(externalUrl);
  });

  it("returns fallback placeholder URL when path is null or empty", async () => {
    const url = await getSignedMediaUrl(null, "flex-posters", 3600, "poster");
    expect(url).toContain("unsplash.com");
  });

  it("returns fallback placeholder when storage fails to sign URL", async () => {
    const url = await getSignedMediaUrl("invalid/path.webp", "flex-posters", 3600, "poster");
    expect(url).toContain("unsplash.com");
  });

  it("lists media records for content ID", async () => {
    const mediaFiles = await listMediaForContent("movie-1", "movie");
    expect(Array.isArray(mediaFiles)).toBe(true);
    expect(mediaFiles.length).toBe(1);
    expect(mediaFiles[0].path).toBe("poster/movie-1/file.webp");
  });

  it("validates allowed upload files correctly", () => {
    const validImage = validateMediaUpload({
      originalName: "poster.png",
      mimeType: "image/png",
      sizeBytes: 2 * 1024 * 1024,
      folder: "movie",
      contentType: "poster",
    });
    expect(validImage.valid).toBe(true);

    const oversizedImage = validateMediaUpload({
      originalName: "huge.png",
      mimeType: "image/png",
      sizeBytes: 15 * 1024 * 1024,
      folder: "movie",
      contentType: "poster",
    });
    expect(oversizedImage.valid).toBe(false);
    expect(oversizedImage.error).toContain("exceeds maximum size limit");

    const invalidType = validateMediaUpload({
      originalName: "exec.exe",
      mimeType: "application/x-msdownload",
      sizeBytes: 500,
      folder: "system",
      contentType: "asset",
    });
    expect(invalidType.valid).toBe(false);
  });

  it("computes public media URL properly", () => {
    const pubUrl = getPublicMediaUrl("poster/file.webp", "flex-movie");
    expect(pubUrl).toBeDefined();
  });

  it("returns optimized image props with dimensions for presets", () => {
    const backdropProps = getOptimizedMediaProps("https://example.com/backdrop.jpg", "backdrop");
    expect(backdropProps.width).toBe(1200);
    expect(backdropProps.height).toBe(675);

    const posterProps = getOptimizedMediaProps("https://example.com/poster.jpg", "poster");
    expect(posterProps.width).toBe(600);
    expect(posterProps.height).toBe(900);
  });
});
