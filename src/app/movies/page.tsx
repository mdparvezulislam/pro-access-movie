import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PosterCard } from "@/components/cards/poster-card";
import { getPublishedMovies } from "@/lib/content/movies";
import { DEMO_GENRES } from "@/lib/content/catalog-fallback";
import { Film, Filter } from "lucide-react";

export default async function MoviesPage() {
  const movies = await getPublishedMovies({ limit: 30 });

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
              <Film className="h-7 w-7 text-red-500" />
              <span>Movies Catalog</span>
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Browse full-length cinema, blockbuster hits, and Bengali classics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Genres:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm pb-1 no-scrollbar">
              <Link
                href="/movies"
                className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                All
              </Link>
              {DEMO_GENRES.map((g) => (
                <Link
                  key={g.id}
                  href={`/genres?name=${encodeURIComponent(g.name)}`}
                  className="px-3 py-1 rounded-full bg-surface-raised border border-border text-xs text-text-secondary hover:text-text-primary hover:border-red-600/60 shrink-0 cursor-pointer transition-colors"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
      </main>

      <Footer />
    </div>
  );
}
