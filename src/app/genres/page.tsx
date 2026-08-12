import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PosterCard } from "@/components/cards/poster-card";
import { DEMO_GENRES, DEMO_MOVIES } from "@/lib/content/catalog-fallback";
import { Compass } from "lucide-react";

export const metadata = {
  title: "Genres — PRO ACCESS MOVIE",
  description: "Browse movies and series by genre on PRO ACCESS MOVIE.",
};

export default async function GenresPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;
  const activeGenreName = params.name || "Action";

  const filteredMovies = DEMO_MOVIES.filter((m) =>
    m.genresList?.some((g) => g.toLowerCase() === activeGenreName.toLowerCase())
  );

  const displayMovies = filteredMovies.length > 0 ? filteredMovies : DEMO_MOVIES;

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
            <Compass className="h-7 w-7 text-red-500" />
            <span>Browse Genres</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Explore movies and series organized by thematic genres
          </p>
        </div>

        {/* Genre Pill Selection */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {DEMO_GENRES.map((g) => {
            const isActive = g.name.toLowerCase() === activeGenreName.toLowerCase();
            return (
              <Link
                key={g.id}
                href={`/genres?name=${encodeURIComponent(g.name)}`}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer shadow-lg ${
                  isActive
                    ? "bg-red-600 text-white border border-red-500"
                    : "bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-red-600/60"
                }`}
              >
                {g.name_bn || g.name}
              </Link>
            );
          })}
        </div>

        {/* Selected Genre Header & Results Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <span>{activeGenreName} Cinema & Series</span>
            <span className="text-xs font-normal text-text-muted">({displayMovies.length} titles)</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayMovies.map((movie) => (
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
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
