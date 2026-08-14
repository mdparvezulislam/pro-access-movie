import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PosterCard } from "@/components/cards/poster-card";
import { getPublishedMovies } from "@/lib/content/movies";
import { DEMO_GENRES } from "@/lib/content/catalog-fallback";
import { Film, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const movies = await getPublishedMovies({ limit: 36 });

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Film className="h-6 w-6 sm:h-7 sm:w-7 text-red-500" />
              <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                Movies Catalog
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 font-mono font-bold text-xs">
                {movies.length} Films
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Browse full-length cinema, blockbuster hits, and Bengali classics in 1080p Ultra HD
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted flex items-center gap-1 shrink-0 font-medium">
              <Filter className="h-3.5 w-3.5" />
              Genres:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm pb-1 no-scrollbar">
              <Link
                href="/movies"
                className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs shrink-0 shadow-sm"
              >
                All
              </Link>
              {DEMO_GENRES.map((g) => (
                <Link
                  key={g.id}
                  href={`/genres?name=${encodeURIComponent(g.name)}`}
                  className="px-3 py-1 rounded-xl bg-surface-raised border border-border/80 text-xs text-text-secondary hover:text-text-primary hover:border-red-500/40 shrink-0 cursor-pointer transition-colors"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {movies.map((movie) => (
              <PosterCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                titleBn={movie.title_bn}
                slug={movie.slug}
                type="movie"
                posterUrl={movie.posterUrl}
                releaseYear={movie.release_year}
                rating={movie.rating}
                badgeText={(movie as unknown as { isBengali?: boolean }).isBengali ?? true ? "BANGLA" : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-surface-raised border border-border/80 space-y-3">
            <Film className="h-10 w-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-text-primary">No movies found</h3>
            <p className="text-xs text-text-muted">Check back shortly as new titles are added daily.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
