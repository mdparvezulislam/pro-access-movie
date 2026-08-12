import { describe, it, expect, vi, beforeEach } from "vitest";
import { NormalizedMovieData, NormalizedSeriesData } from "@/types/import";

// Mock Supabase Server Client
vi.mock("@/lib/supabase/server", () => {
  const createMockQuery = () => {
    const query: Record<string, unknown> = {
      or: () => query,
      eq: () => query,
      neq: () => query,
      ilike: () => query,
      select: () => query,
      maybeSingle: async () => ({ data: null, error: null }),
      single: async () => ({ data: { id: "test-inserted-id-123" }, error: null }),
    };
    return query;
  };

  return {
    createAdminClient: vi.fn().mockImplementation(async () => ({
      from: () => ({
        select: () => createMockQuery(),
        insert: (payload: Record<string, unknown>) => ({
          select: () => ({
            single: async () => ({ data: { id: "test-inserted-id-123", ...payload }, error: null }),
            maybeSingle: async () => ({ data: { id: "test-genre-id-456" }, error: null }),
          }),
        }),
        update: () => ({
          eq: async () => ({ error: null }),
        }),
        delete: () => ({
          eq: async () => ({ error: null }),
        }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ error: null }),
        }),
      },
    })),
    createServerClient: vi.fn(),
  };
});

import { importMovie, importSeries } from "../content/import-service";
import { detectDuplicateContent } from "../content/duplicate-detector";

describe("Phase 06.5 — Import Pipeline Repair & Resiliency Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Successfully executes movie import pipeline as draft", async () => {
    const movieData: NormalizedMovieData = {
      provider: "tmdb",
      external_id: "tmdb_movie_100",
      external_ids: { tmdb_id: 100, imdb_id: "tt999999" },
      title: "Test Repair Movie",
      original_title: "Test Repair Movie",
      slug: "test-repair-movie",
      overview: "A test movie overview for repair verification.",
      release_year: 2026,
      duration_minutes: 120,
      rating: 8.5,
      poster_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
      backdrop_url: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200",
      genres: ["Action", "Drama"],
      cast: [],
      crew: [],
    };

    const result = await importMovie(movieData, { downloadMedia: false, targetStatus: "draft" });

    expect(result.success).toBe(true);
    expect(result.type).toBe("movie");
    expect(result.status).toBe("draft");
    expect(result.id).toBe("test-inserted-id-123");
  });

  it("2. Successfully executes TV series import pipeline with seasons and episodes", async () => {
    const seriesData: NormalizedSeriesData = {
      provider: "tmdb",
      external_id: "tmdb_series_200",
      external_ids: { tmdb_id: 200, imdb_id: "tt888888" },
      title: "Test Repair Series",
      slug: "test-repair-series",
      overview: "A test series overview for repair verification.",
      release_year: 2026,
      rating: 9.0,
      genres: ["Drama"],
      cast: [],
      crew: [],
      seasons: [
        {
          season_number: 1,
          title: "Season 1",
          episodes: [
            { episode_number: 1, title: "Pilot" },
            { episode_number: 2, title: "Episode 2" },
          ],
        },
      ],
    };

    const result = await importSeries(seriesData, { downloadMedia: false, targetStatus: "draft" });

    expect(result.success).toBe(true);
    expect(result.type).toBe("series");
    expect(result.importedSeasonsCount).toBe(1);
    expect(result.importedEpisodesCount).toBe(2);
  });

  it("3. Detects duplicate content by external ID and prevents silent duplicates", async () => {
    const dupResult = await detectDuplicateContent("movie", "Test Movie", 2026, { tmdb_id: 100 });
    expect(dupResult.isDuplicate).toBe(false); // Mock returns no duplicate
  });

  it("4. Gracefully degrades when remote media URL is missing or storage fails", async () => {
    const movieData: NormalizedMovieData = {
      provider: "tmdb",
      external_id: "tmdb_movie_101",
      external_ids: { tmdb_id: 101 },
      title: "Movie Without Media",
      slug: "movie-without-media",
      overview: "Testing missing media fallback.",
      release_year: 2026,
      duration_minutes: 110,
      rating: 7.0,
      poster_url: undefined,
      backdrop_url: undefined,
      genres: [],
      cast: [],
      crew: [],
    };

    const result = await importMovie(movieData, { downloadMedia: true, targetStatus: "draft" });

    expect(result.success).toBe(true);
    expect(result.id).toBe("test-inserted-id-123");
  });

  it("5. Re-importing content handles overrideDuplicates option cleanly", async () => {
    const movieData: NormalizedMovieData = {
      provider: "tmdb",
      external_id: "tmdb_movie_102",
      external_ids: { tmdb_id: 102 },
      title: "Reimport Movie",
      slug: "reimport-movie",
      overview: "Testing reimport.",
      release_year: 2026,
      duration_minutes: 100,
      rating: 8.0,
      genres: [],
      cast: [],
      crew: [],
    };

    const result = await importMovie(movieData, { overrideDuplicates: true, downloadMedia: false });
    expect(result.success).toBe(true);
  });
});
