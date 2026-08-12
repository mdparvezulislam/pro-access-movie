import { describe, it, expect, vi } from "vitest";
import { getPublishedMovies, getMovieBySlug } from "../movies";
import { getPublishedSeries } from "../series";
import { searchPublishedContent } from "../search";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockImplementation((table: string) => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockImplementation(() => {
          if (table === "movies") {
            return Promise.resolve({
              data: [
                {
                  id: "movie-1",
                  title: "Hawa",
                  title_bn: "হাওয়া",
                  slug: "hawa-2022",
                  status: "published",
                  release_year: 2022,
                  media: { posterUrl: "https://example.com/poster.jpg" },
                },
              ],
              error: null,
            });
          }
          if (table === "series") {
            return Promise.resolve({
              data: [
                {
                  id: "series-1",
                  title: "Karagar",
                  title_bn: "কারাগার",
                  slug: "karagar-2022",
                  status: "published",
                  release_year: 2022,
                  media: { posterUrl: "https://example.com/poster.jpg" },
                },
              ],
              error: null,
            });
          }
          return Promise.resolve({ data: [], error: null });
        }),
        maybeSingle: vi.fn().mockImplementation(() => {
          if (table === "movies") {
            return Promise.resolve({
              data: {
                id: "movie-1",
                title: "Hawa",
                slug: "hawa-2022",
                status: "published",
              },
              error: null,
            });
          }
          return Promise.resolve({ data: null, error: null });
        }),
      };
      return mockChain;
    }),
  }),
}));

describe("Content Services (Movies & Series)", () => {
  it("fetches published movies returning typed arrays", async () => {
    const movies = await getPublishedMovies({ limit: 10, offset: 0 });
    expect(Array.isArray(movies)).toBe(true);
    expect(movies.length).toBe(1);
    expect(movies[0].slug).toBe("hawa-2022");
    expect(movies[0].status).toBe("published");
  });

  it("fetches movie by slug", async () => {
    const movie = await getMovieBySlug("hawa-2022");
    expect(movie).not.toBeNull();
    expect(movie?.id).toBe("movie-1");
  });

  it("returns null for non-existent movie slug", async () => {
    const movie = await getMovieBySlug("");
    expect(movie).toBeNull();
  });

  it("fetches published series returning typed arrays", async () => {
    const seriesList = await getPublishedSeries({ limit: 10, offset: 0 });
    expect(Array.isArray(seriesList)).toBe(true);
    expect(seriesList.length).toBe(1);
    expect(seriesList[0].slug).toBe("karagar-2022");
  });

  it("handles search queries gracefully", async () => {
    const results = await searchPublishedContent({ query: "hawa", limit: 5 });
    expect(Array.isArray(results)).toBe(true);
  });
});
