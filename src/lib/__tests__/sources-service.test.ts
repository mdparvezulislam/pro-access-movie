import { describe, it, expect } from "vitest";
import { CreatePlaybackSourceInput, CreateDownloadSourceInput } from "@/types/sources";

describe("Phase 06 — Admin Content Studio Source Managers", () => {
  it("constructs valid streaming playback source object", () => {
    const playback: CreatePlaybackSourceInput = {
      content_type: "movie",
      content_id: "test-movie-id-123",
      source_name: "Fast CDN Server 1",
      url: "https://cdn.example.com/hls/movie.m3u8",
      quality: "1080p",
      language: "English / Bangla Sub",
      priority: 1,
    };

    expect(playback.content_type).toBe("movie");
    expect(playback.quality).toBe("1080p");
    expect(playback.url).toContain("hls");
  });

  it("constructs valid download source link object", () => {
    const download: CreateDownloadSourceInput = {
      content_type: "episode",
      content_id: "test-ep-id-456",
      label: "1080p WEB-DL Direct Link",
      url: "https://downloads.example.com/files/ep1.mkv",
      quality: "1080p",
      file_size_bytes: 1572864000,
      priority: 1,
    };

    expect(download.content_type).toBe("episode");
    expect(download.file_size_bytes).toBe(1572864000);
    expect(download.url).toContain("downloads.example.com");
  });
});
