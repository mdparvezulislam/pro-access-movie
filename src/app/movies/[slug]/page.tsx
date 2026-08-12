import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PosterCard } from "@/components/cards/poster-card";
import { getMovieBySlug, getRelatedMovies } from "@/lib/content/movies";
import { checkInWatchlist } from "@/features/user/lib/watchlist";
import { Play, Star, Clock, Bookmark, Film, Download, ShieldCheck, Info } from "lucide-react";
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

  const [relatedMovies, inWatchlist] = await Promise.all([
    getRelatedMovies(movie.id, 6),
    checkInWatchlist(movie.id, "movie"),
  ]);

  const title = movie.title;
  const titleBn = movie.title_bn;
  const description = movie.description || "Stream high quality Bengali movies and international cinema on PRO ACCESS MOVIE.";
  const backdropUrl = movie.backdropUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop";
  const posterUrl = movie.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop";
  const rating = movie.rating || 8.8;

  // Mock cast list for demo presentation
  const demoCast = [
    { name: "Afran Nisho", nameBn: "আফরান নিশো", character: "Masud (Tunnel Electrician)" },
    { name: "Tama Mirza", nameBn: "তমা মির্জা", character: "Moyna" },
    { name: "Mostafa Monwar", nameBn: "মোস্তফা মনওয়ার", character: "Kiron" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      {/* 1. CINEMATIC HERO BACKDROP BANNER */}
      <div className="relative w-full h-[60vh] md:h-[72vh] flex items-end p-4 md:p-12 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover filter brightness-90 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded bg-red-600 font-extrabold text-[10px] text-white uppercase tracking-wider">
              {(movie as unknown as { isBengali?: boolean }).isBengali ?? true ? "BANGLA ORIGINAL" : "DUAL AUDIO"}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              {rating} / 10
            </span>
            {movie.release_year && (
              <span className="px-2.5 py-0.5 rounded bg-white/10 text-xs font-bold text-neutral-300 border border-white/10">
                {movie.release_year}
              </span>
            )}
            {movie.duration_minutes && (
              <span className="flex items-center gap-1 text-xs text-neutral-300">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {movie.duration_minutes} min
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight leading-none">
              {title}
            </h1>
            {titleBn && (
              <h2 className="text-xl md:text-2xl text-red-400 font-bold font-bengali">
                {titleBn}
              </h2>
            )}
          </div>

          <p className="text-xs md:text-sm text-neutral-300 leading-relaxed line-clamp-3 max-w-2xl">
            {description}
          </p>

          <div className="flex items-center gap-3 pt-3 flex-wrap">
            <Link href={`/watch/movie/${movie.slug}`}>
              <Button variant="cinematic" size="lg" className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-8 shadow-xl shadow-red-600/30 gap-2">
                <Play className="w-5 h-5 fill-current" />
                <span>Start Watching</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className={`gap-2 font-bold ${
                inWatchlist ? "text-emerald-400 border-emerald-500/50" : "text-white border-white/20"
              }`}
            >
              <Bookmark className="w-5 h-5" />
              <span>{inWatchlist ? "In My List" : "Add to My List"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. DETAILS & METADATA GRID */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 md:px-12 py-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Overview Box */}
            <div className="p-6 rounded-3xl bg-surface-raised border border-border backdrop-blur-md space-y-4">
              <h3 className="text-base font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-red-500" />
                <span>Storyline & Overview</span>
              </h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">{description}</p>
              {movie.description_bn && (
                <p className="text-xs md:text-sm text-red-400 font-bengali leading-relaxed pt-2 border-t border-border">
                  {movie.description_bn}
                </p>
              )}
            </div>

            {/* Cast Section */}
            <div className="p-6 rounded-3xl bg-surface-raised border border-border backdrop-blur-md space-y-4">
              <h3 className="text-base font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                <span>Starring Cast & Crew</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {demoCast.map((c, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-surface-base border border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-overlay flex items-center justify-center font-black text-sm text-red-500 shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-text-primary truncate">{c.nameBn || c.name}</p>
                      <p className="text-[10px] text-text-muted truncate">{c.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authorized Download Section */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-surface-raised via-surface-raised to-red-950/20 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Download className="w-5 h-5 text-red-500" />
                  <span>Authorized Download Options</span>
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Fast CDN Links
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { quality: "1080p Full HD", size: "1.4 GB", server: "Dhaka HighSpeed CDN" },
                  { quality: "720p HD", size: "850 MB", server: "Global Edge CDN" },
                ].map((option, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-surface-base border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">{option.server}</span>
                        <span className="px-2 py-0.5 rounded bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold">
                          {option.quality}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted">
                        Bengali Original Dual Audio • <strong className="text-text-primary">{option.size}</strong>
                      </p>
                    </div>

                    <Link href={`/watch/movie/${movie.slug}`}>
                      <Button size="sm" variant="cinematic" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 gap-1.5">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-4 rounded-3xl bg-surface-raised border border-border space-y-4 text-xs">
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-surface-base border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2 pt-2 border-t border-border text-text-secondary">
                <div className="flex justify-between">
                  <span className="text-text-muted">Release Year:</span>
                  <strong className="text-text-primary">{movie.release_year ?? 2024}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">User Rating:</span>
                  <strong className="text-amber-400">★ {rating} / 10</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Audio Track:</span>
                  <strong className="text-text-primary">Bengali Original</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtitles:</span>
                  <strong className="text-text-primary">English, Bangla</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Resolution:</span>
                  <strong className="text-emerald-400">1080p Ultra HD</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIMILAR CONTENT RAIL */}
        {relatedMovies.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-border">
            <h3 className="text-xl font-black text-text-primary">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {relatedMovies.map((rec) => (
                <PosterCard
                  key={rec.id}
                  id={rec.id}
                  title={rec.title}
                  titleBn={rec.titleBn}
                  slug={rec.slug}
                  type="movie"
                  posterUrl={rec.posterUrl || ""}
                  releaseYear={rec.releaseYear}
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
