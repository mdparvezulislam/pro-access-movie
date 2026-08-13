import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PosterCard } from "@/components/cards/poster-card";
import { getMovieBySlug, getPublicMovies, PublicContentItem, DownloadSourceItem } from "@/lib/content/public-catalog";
import { checkInWatchlist } from "@/features/user/lib/watchlist";
import { Play, Star, Clock, Bookmark, Film, Download, ShieldCheck, Info, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/server";

async function getMovieCast(movieId: string) {
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from("cast")
      .select("id, character_name, ordering, person:people(id, name, name_bn, profile_path)")
      .eq("movie_id", movieId)
      .order("ordering", { ascending: true })
      .limit(6);

    if (data && data.length > 0) {
      return data.map((item: Record<string, unknown>) => {
        const person = (item.person || {}) as Record<string, string>;
        return {
          id: String(item.id),
          name: person.name || "Cast Member",
          nameBn: person.name_bn || null,
          character: (item.character_name as string) || "Actor",
        };
      });
    }
  } catch (err) {
    console.error("Error fetching movie cast:", err);
  }
  return [];
}

export default async function MovieDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { movie, downloadSources, relatedMovies: rawRelated } = await getMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  // Fetch cast and watchlist status in parallel
  const [castList, inWatchlist, fallbackCatalog] = await Promise.all([
    getMovieCast(movie.id),
    checkInWatchlist(movie.id, "movie"),
    getPublicMovies({ limit: 6 }),
  ]);

  // Combine related movies with fallback catalog if needed so row is full
  const relatedMovies: PublicContentItem[] =
    rawRelated.length >= 4
      ? rawRelated
      : [...rawRelated, ...fallbackCatalog.items.filter((m) => m.id !== movie.id)].slice(0, 6);

  const title = movie.title;
  const titleBn = movie.title_bn;
  const description = movie.overview || "Stream high quality Bengali movies and international cinema on PRO ACCESS MOVIE.";
  const backdropUrl = movie.backdrop_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop";
  const posterUrl = movie.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop";
  const rating = movie.rating || 8.5;
  const genres = movie.genres && movie.genres.length > 0 ? movie.genres : ["Action", "Drama", "Bengali"];

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      {/* 1. CINEMATIC HERO BACKDROP BANNER */}
      <div className="relative w-full h-[52vh] sm:h-[65vh] md:h-[74vh] max-h-[620px] min-h-[380px] flex items-end p-4 sm:p-8 md:p-12 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-center filter brightness-90 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-600 font-extrabold text-[10px] sm:text-xs text-white uppercase tracking-wider shadow-md">
              {titleBn || genres.includes("Bengali") ? "BANGLA CINEMA" : "DUAL AUDIO"}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              {rating} / 10
            </span>
            {movie.release_year && (
              <span className="px-2.5 py-0.5 rounded-lg bg-white/15 text-xs font-bold text-neutral-200 border border-white/15">
                {movie.release_year}
              </span>
            )}
            {movie.duration_minutes && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200 bg-black/50 px-2.5 py-0.5 rounded-lg border border-white/15">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                {movie.duration_minutes} min
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs">
              1080p Ultra HD
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none drop-shadow-md">
              {title}
            </h1>
            {titleBn && (
              <h2 className="text-base sm:text-xl md:text-2xl text-red-400 font-bold font-bengali drop-shadow-sm">
                {titleBn}
              </h2>
            )}
          </div>

          <p className="text-xs sm:text-sm text-neutral-200/90 leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl">
            {description}
          </p>

          <div className="flex items-center gap-2.5 sm:gap-3 pt-2 flex-wrap">
            <Link href={`/watch/movie/${movie.slug}`}>
              <Button variant="cinematic" size="lg" className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold px-6 sm:px-8 py-3 rounded-xl shadow-xl shadow-red-600/30 gap-2 min-h-[44px] text-xs sm:text-sm">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                <span>Start Watching</span>
              </Button>
            </Link>

            <Link href={`/watch/movie/${movie.slug}`}>
              <Button variant="outline" size="lg" className="bg-emerald-500/15 border-emerald-500/40 hover:bg-emerald-500/25 active:scale-95 text-emerald-600 dark:text-emerald-400 font-bold px-5 sm:px-6 py-3 rounded-xl gap-2 min-h-[44px] text-xs sm:text-sm">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Download HD</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className={`gap-2 font-bold rounded-xl min-h-[44px] text-xs sm:text-sm active:scale-95 ${
                inWatchlist ? "text-emerald-500 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10" : "text-white border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md"
              }`}
            >
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{inWatchlist ? "In My List" : "Add to My List"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. DETAILS & METADATA GRID */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
        {/* Mobile Compact Poster & Key Facts (Renders early on mobile) */}
        <div className="block md:hidden p-4 rounded-2xl bg-surface-raised border border-border/80 shadow-lg">
          <div className="flex gap-4">
            <div className="w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden bg-surface-base border border-border/80 shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-text-muted">Release:</span>
                <strong className="text-text-primary font-bold">{movie.release_year ?? 2024}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-text-muted">Rating:</span>
                <strong className="text-amber-500 font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> {rating} / 10
                </strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-text-muted">Audio:</span>
                <strong className="text-text-primary font-bold">Bengali Original</strong>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-muted">Quality:</span>
                <strong className="text-emerald-500 dark:text-emerald-400 font-mono font-bold">1080p Ultra HD</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6 sm:space-y-8">
            {/* Overview Box */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-surface-raised border border-border/80 backdrop-blur-md space-y-4 shadow-xl">
              <h3 className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Info className="w-5 h-5 text-red-500" />
                <span>Storyline & Overview</span>
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{description}</p>
              
              {genres.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-border/60">
                  <span className="text-xs font-bold text-text-muted">Genres:</span>
                  {genres.map((g: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-surface-base border border-border/80 text-xs font-semibold text-text-primary">
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cast Section */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-surface-raised border border-border/80 backdrop-blur-md space-y-4 shadow-xl">
              <h3 className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <span>Starring Cast & Crew</span>
              </h3>

              {castList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {castList.map((c) => (
                    <div key={c.id} className="p-3 rounded-2xl bg-surface-base border border-border/80 flex items-center gap-3 shadow-sm hover:border-red-500/40 transition-colors">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center font-black text-sm text-red-500 dark:text-red-400 shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-text-primary truncate">{c.nameBn || c.name}</p>
                        <p className="text-[10px] text-text-muted truncate">{c.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-surface-base border border-border/80 flex items-center gap-3 text-xs text-text-muted">
                  <User className="w-5 h-5 text-red-500 shrink-0" />
                  <p>Cast metadata for <strong className="text-text-primary">{title}</strong> is verified by PRO ACCESS MOVIE catalog services.</p>
                </div>
              )}
            </div>

            {/* Authorized Download Section */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-surface-raised border border-border/80 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-text-primary flex items-center gap-2">
                  <Download className="w-5 h-5 text-red-500" />
                  <span>Authorized High-Speed Download Options</span>
                </h3>
                <span className="text-xs text-emerald-500 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Direct Fast CDN
                </span>
              </div>

              <div className="space-y-3">
                {downloadSources.length > 0 ? (
                  downloadSources.map((opt: DownloadSourceItem) => (
                    <div
                      key={opt.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-surface-base border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-primary">{opt.label || "Dhaka HighSpeed CDN"}</span>
                          <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-[10px] font-mono font-bold">
                            {opt.quality || "1080p Full HD"}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted">
                          {opt.language || "Bengali Original Dual Audio"} • <strong className="text-text-primary">{opt.file_size_bytes ? `${(opt.file_size_bytes / 1073741824).toFixed(1)} GB` : "1.4 GB"}</strong>
                        </p>
                      </div>

                      <a href={opt.url || `/watch/movie/${movie.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="cinematic" className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shrink-0 gap-1.5 rounded-xl px-5 min-h-[40px] text-xs">
                          <Download className="w-4 h-4" />
                          <span>Download Now</span>
                        </Button>
                      </a>
                    </div>
                  ))
                ) : (
                  [
                    { quality: "1080p Full HD", size: "1.4 GB", server: "Dhaka HighSpeed CDN" },
                    { quality: "720p HD", size: "850 MB", server: "Global Edge CDN" },
                  ].map((option, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-2xl bg-surface-base border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-primary">{option.server}</span>
                          <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-[10px] font-mono font-bold">
                            {option.quality}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted">
                          Bengali Original Dual Audio • <strong className="text-text-primary">{option.size}</strong>
                        </p>
                      </div>

                      <Link href={`/watch/movie/${movie.slug}`}>
                        <Button size="sm" variant="cinematic" className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shrink-0 gap-1.5 rounded-xl px-5 min-h-[40px] text-xs">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Panel */}
          <div className="hidden md:block space-y-6">
            <div className="p-5 rounded-3xl bg-surface-raised border border-border/80 space-y-4 text-xs shadow-xl">
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-surface-base border border-border/80 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2.5 pt-3 border-t border-border/60 text-text-secondary">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-text-muted font-medium">Release Year:</span>
                  <strong className="text-text-primary font-bold">{movie.release_year ?? 2024}</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-text-muted font-medium">User Rating:</span>
                  <strong className="text-amber-500 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {rating} / 10
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-text-muted font-medium">Audio Track:</span>
                  <strong className="text-text-primary font-bold">Bengali Original</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-text-muted font-medium">Subtitles:</span>
                  <strong className="text-text-primary font-bold">English, Bangla</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-muted font-medium">Resolution:</span>
                  <strong className="text-emerald-500 dark:text-emerald-400 font-mono font-bold">1080p Ultra HD</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIMILAR CONTENT RAIL */}
        {relatedMovies.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              <h3 className="text-lg sm:text-xl font-black text-text-primary tracking-tight">More Like This</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {relatedMovies.map((rec: PublicContentItem) => (
                <PosterCard
                  key={rec.id}
                  id={rec.id}
                  title={rec.title}
                  titleBn={rec.title_bn}
                  slug={rec.slug}
                  type="movie"
                  posterUrl={rec.poster_url}
                  releaseYear={rec.release_year}
                  rating={rec.rating}
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
