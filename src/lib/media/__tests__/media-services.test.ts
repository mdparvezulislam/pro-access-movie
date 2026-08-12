import { describe, it, expect, vi } from "vitest";
import { getSignedMediaUrl, listMediaForContent } from "../storage";

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
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "media-1",
            bucket: "flex-posters",
            path: "poster/movie-1/file.webp",
            original_name: "poster.webp",
            mime_type: "image/webp",
            size_bytes: 1024500,
            content_type: "poster",
            status: "active",
          },
        ],
        error: null,
      }),
    })),
  }),
  createAdminClient: vi.fn(),
}));

describe("Media Storage Service (storage.ts)", () => {
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
});
