import { describe, it, expect } from "vitest";
import { slugifyText } from "../slugify";
import { DemoProvider } from "@/lib/providers/demo-provider";
import { providerRegistry } from "@/lib/providers/provider-registry";

describe("Phase 04 — Metadata Provider Abstraction", () => {
  it("registers and retrieves DemoProvider", () => {
    const provider = providerRegistry.getProvider("demo");
    expect(provider).toBeDefined();
    expect(provider.name).toContain("Demo");
  });

  it("searches Demo catalog for movie and series results", async () => {
    const provider = new DemoProvider();
    const results = await provider.search("Hawa");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe("Hawa");
    expect(results[0].type).toBe("movie");
  });

  it("fetches movie details with normalized fields", async () => {
    const provider = new DemoProvider();
    const movie = await provider.getMovieDetails("demo_hawa_2022");
    expect(movie.title).toBe("Hawa");
    expect(movie.release_year).toBe(2022);
    expect(movie.genres).toContain("Mystery");
    expect(movie.cast.length).toBeGreaterThan(0);
  });

  it("fetches series details with seasons and episodes", async () => {
    const provider = new DemoProvider();
    const series = await provider.getSeriesDetails("demo_karagar_2022");
    expect(series.title).toBe("Karagar");
    expect(series.seasons.length).toBeGreaterThan(0);
    expect(series.seasons[0].episodes.length).toBeGreaterThan(0);
  });
});

describe("Phase 04 — Slugify Helper", () => {
  it("normalizes English titles into clean slugs", () => {
    expect(slugifyText("Breaking Bad (2008)")).toBe("breaking-bad-2008");
    expect(slugifyText("Inception & The Matrix!")).toBe("inception-the-matrix");
  });

  it("normalizes Bengali titles gracefully", () => {
    const slug = slugifyText("হাওয়া ২০২২");
    expect(slug).toBe("হাওয়া-২০২২");
  });
});
