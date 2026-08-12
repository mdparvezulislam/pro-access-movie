import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PosterCard } from "@/components/cards/poster-card";
import { searchPublishedContent } from "@/lib/content/search";
import { DEMO_GENRES, DEMO_MOVIES, DEMO_SERIES } from "@/lib/content/catalog-fallback";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q || "").trim();

  let results = query ? await searchPublishedContent({ query, limit: 20 }) : [];

  // Fallback query search against DEMO_MOVIES / DEMO_SERIES if DB returned empty
  if (query && results.length === 0) {
    const q = query.toLowerCase();
    const movieMatches = DEMO_MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.title_bn && m.title_bn.includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q))
    ).map((m) => ({
      id: m.id,
      title: m.title,
      titleBn: m.title_bn,
      slug: m.slug,
      type: "movie" as const,
      status: m.status,
      releaseYear: m.release_year,
      durationMinutes: m.duration_minutes,
      rating: m.rating,
      posterUrl: m.posterUrl,
      backdropUrl: m.backdropUrl,
    }));

    const seriesMatches = DEMO_SERIES.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.title_bn && s.title_bn.includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
    ).map((s) => ({
      id: s.id,
      title: s.title,
      titleBn: s.title_bn,
      slug: s.slug,
      type: "series" as const,
      status: s.status,
      releaseYear: s.release_year,
      durationMinutes: null,
      rating: s.rating,
      posterUrl: s.posterUrl,
      backdropUrl: s.backdropUrl,
    }));

    results = [...movieMatches, ...seriesMatches];
  }

  // Suggestions if no query
  const suggestions = [...DEMO_MOVIES, ...DEMO_SERIES].slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center justify-center gap-2">
            <Search className="h-7 w-7 text-red-500" />
            <span>Search PRO ACCESS Catalog</span>
          </h1>
          <p className="text-xs text-text-muted">
            Search titles in English, Bengali, or Banglish (e.g., &quot;hawa&quot;, &quot;surongo&quot;, &quot;karaghar&quot;)
          </p>

          <form action="/search" method="GET" className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search movies, series, actors..."
              className="pl-12 h-12 text-sm bg-surface-raised border-border focus:border-red-600 rounded-2xl shadow-lg"
            />
          </form>

          {/* Genre Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {DEMO_GENRES.map((g) => (
              <Link
                key={g.id}
                href={`/search?q=${encodeURIComponent(g.name)}`}
                className="px-3.5 py-1 rounded-full bg-surface-raised border border-border text-xs text-text-secondary hover:text-text-primary hover:border-red-600/60 transition-colors"
              >
                {g.name_bn || g.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {query ? (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                Search Results for &quot;<span className="text-red-500">{query}</span>&quot;
              </h2>
              <span className="text-xs text-text-muted">{results.length} items found</span>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.map((item) => (
                  <PosterCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    titleBn={item.titleBn}
                    slug={item.slug}
                    type={item.type}
                    posterUrl={item.posterUrl || ""}
                    releaseYear={item.releaseYear}
                    rating={item.rating}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-surface-raised border border-border space-y-3">
                <Sparkles className="h-10 w-10 text-red-500 mx-auto" />
                <h3 className="text-base font-bold text-text-primary">No exact matches found</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Try searching with keywords like &quot;surongo&quot;, &quot;toofan&quot;, or &quot;karaghar&quot;.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <h2 className="text-base font-bold text-text-primary">Recommended Searches</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {suggestions.map((item: { id: string; title: string; title_bn?: string | null; slug: string; posterUrl?: string; release_year?: number | null; rating?: number | null }) => (
                <PosterCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  titleBn={item.title_bn}
                  slug={item.slug}
                  type="movie"
                  posterUrl={item.posterUrl || undefined}
                  releaseYear={item.release_year}
                  rating={item.rating}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
