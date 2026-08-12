import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { searchPublishedContent } from "@/lib/content/search";
import { getGenres } from "@/lib/content/genres";
import { Search, Film, Star, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const [results, genres] = await Promise.all([
    query ? searchPublishedContent({ query, limit: 20 }) : Promise.resolve([]),
    getGenres(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center justify-center gap-2">
            <Search className="h-7 w-7 text-red-500" />
            <span>Search Catalog</span>
          </h1>
          <p className="text-xs text-text-secondary">
            Search titles in English, Bengali, or Banglish (e.g., &quot;hawa&quot;, &quot;surung&quot;, &quot;karagar&quot;)
          </p>

          <form action="/search" method="GET" className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search movies, series, actors..."
              className="pl-12 h-12 text-sm bg-surface-base border-border focus:border-red-500 rounded-2xl shadow-lg"
            />
          </form>

          {/* Genre Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {genres.map((g) => (
              <Link
                key={g.id}
                href={`/search?q=${encodeURIComponent(g.name)}`}
                className="px-3 py-1 rounded-full bg-surface-raised border border-border text-xs text-text-secondary hover:text-text-primary hover:border-red-500/50 transition-colors"
              >
                {g.name}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.type === "movie" ? "movies" : "series"}/${item.slug}`}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-950/20"
                  >
                    <div className="aspect-[2/3] w-full bg-surface-raised relative overflow-hidden">
                      {item.posterUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-text-muted">
                          <Film className="h-10 w-10 opacity-30" />
                        </div>
                      )}

                      {item.rating && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{item.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-surface-base">
                      <h3 className="font-bold text-sm text-text-primary truncate group-hover:text-red-500 transition-colors">
                        {item.title}
                      </h3>
                      {item.titleBn && (
                        <p className="text-xs text-text-muted truncate font-bengali">{item.titleBn}</p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-text-secondary mt-2 pt-2 border-t border-border-muted">
                        <span>{item.releaseYear ?? "2026"}</span>
                        <span className="text-red-400 font-semibold capitalize">{item.type}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-surface-base border border-border-muted space-y-3">
                <Sparkles className="h-10 w-10 text-text-muted mx-auto" />
                <h3 className="text-base font-bold text-text-primary">No results found</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Try searching with different Banglish keywords or browse popular movies.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-surface-base border border-border-muted space-y-2">
            <Search className="h-10 w-10 text-text-muted mx-auto" />
            <p className="text-xs text-text-secondary">Type a query above to start searching PRO ACCESS MOVIE catalog</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
