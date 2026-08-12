import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getPublishedMovies } from "@/lib/content/movies";
import { getGenres } from "@/lib/content/genres";
import { Film, Star, Clock, Filter } from "lucide-react";

export default async function MoviesPage() {
  const [movies, genres] = await Promise.all([
    getPublishedMovies({ limit: 24 }),
    getGenres(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
              <Film className="h-7 w-7 text-red-500" />
              <span>Movies Catalog</span>
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Browse full-length cinema, blockbuster hits, and Bengali classics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Genres:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm pb-1 no-scrollbar">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white font-semibold text-xs shrink-0 cursor-pointer">
                All
              </span>
              {genres.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-full bg-surface-raised border border-border text-xs text-text-secondary hover:text-text-primary shrink-0 cursor-pointer transition-colors"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.slug}`}
              className="group relative rounded-xl overflow-hidden bg-card border border-border transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-950/20"
            >
              <div className="aspect-[2/3] w-full bg-surface-raised relative overflow-hidden">
                {movie.posterUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-text-muted">
                    <Film className="h-10 w-10 opacity-30" />
                  </div>
                )}

                {movie.rating && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{movie.rating}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-surface-base">
                <h3 className="font-bold text-sm text-text-primary truncate group-hover:text-red-500 transition-colors">
                  {movie.title}
                </h3>
                {movie.title_bn && (
                  <p className="text-xs text-text-muted truncate font-bengali">{movie.title_bn}</p>
                )}
                <div className="flex items-center justify-between text-[11px] text-text-secondary mt-2 pt-2 border-t border-border-muted">
                  <span>{movie.release_year ?? "2026"}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {movie.duration_minutes ? `${movie.duration_minutes}m` : "HD"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
