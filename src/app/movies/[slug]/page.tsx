import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { ContentRail } from "@/components/common/content-rail";
import { getMovieBySlug, getRelatedMovies } from "@/lib/content/movies";
import { getPlaybackSourcesForMovie } from "@/lib/playback/sources";
import { checkInWatchlist } from "@/features/user/lib/watchlist";
import { Play, Star, Clock, Calendar, Bookmark, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function MovieDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  const [relatedMovies, sources, inWatchlist] = await Promise.all([
    getRelatedMovies(movie.id, 6),
    getPlaybackSourcesForMovie(movie.id),
    checkInWatchlist(movie.id, "movie"),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* Hero Backdrop Spotlight */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] bg-surface-raised overflow-hidden">
        {movie.backdropUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-text-muted bg-surface-base">
            <Film className="h-20 w-20 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

        {/* Floating Content Header */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 flex flex-col sm:flex-row items-end gap-6 z-10">
          {/* Poster Thumb */}
          <div className="hidden sm:block w-44 shrink-0 rounded-2xl overflow-hidden border-2 border-border shadow-2xl bg-card aspect-[2/3]">
            {movie.posterUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-text-muted">
                <Film className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 font-bold text-[10px] text-white uppercase">
                Movie
              </span>
              {movie.content_rating && (
                <span className="px-2 py-0.5 rounded bg-surface-raised border border-border text-[10px] font-semibold text-text-secondary">
                  {movie.content_rating}
                </span>
              )}
              {movie.rating && (
                <span className="px-2 py-0.5 rounded bg-black/80 text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {movie.rating}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight leading-none">
              {movie.title}
            </h1>
            {movie.title_bn && (
              <h2 className="text-xl font-bold text-red-400 font-bengali">{movie.title_bn}</h2>
            )}

            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {movie.release_year ?? "2026"}
              </span>
              {movie.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {movie.duration_minutes} Minutes
                </span>
              )}
              <span>{sources.length} Streaming Mirrors</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Link href={`/watch/movie/${movie.slug}`}>
                <Button variant="cinematic" size="lg" className="gap-2 text-sm shadow-xl shadow-red-950/40">
                  <Play className="h-5 w-5 fill-current" />
                  <span>Watch Now</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className={`gap-2 text-sm border-border ${
                  inWatchlist ? "text-red-500 border-red-500/50" : "text-text-primary"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>{inWatchlist ? "In My List" : "Add to List"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Synopsis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-text-primary">Synopsis</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {movie.description || "No English synopsis available for this title."}
            </p>
            {movie.description_bn && (
              <div className="p-4 rounded-xl bg-surface-base border border-border space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase">বাংলা সারাংশ</span>
                <p className="text-sm text-text-primary font-bengali leading-relaxed">
                  {movie.description_bn}
                </p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-4 text-xs">
            <h4 className="font-bold text-text-primary text-sm border-b border-border pb-2">
              Content Information
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className="text-emerald-400 font-semibold uppercase">{movie.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Release Year</span>
                <span className="text-text-primary font-medium">{movie.release_year ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Runtime</span>
                <span className="text-text-primary font-medium">
                  {movie.duration_minutes ? `${movie.duration_minutes} mins` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Audio / Language</span>
                <span className="text-text-primary font-medium">Bengali / English</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Content Rail */}
        {relatedMovies.length > 0 && (
          <ContentRail
            title="More Like This"
            subtitle="Recommended movies based on genres"
            items={relatedMovies}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
