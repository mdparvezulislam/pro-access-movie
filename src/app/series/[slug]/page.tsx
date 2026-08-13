import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getSeriesBySlug, getSeriesSeasonsAndEpisodes } from "@/lib/content/series";
import { Play, Star, Bookmark, Layers, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SeriesDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) {
    notFound();
  }

  const { episodes } = await getSeriesSeasonsAndEpisodes(series.id);
  const mediaObj = (series.media as Record<string, string>) || {};
  const backdropUrl = (series as { backdropUrl?: string }).backdropUrl || mediaObj.backdropUrl || "https://images.unsplash.com/photo-1518676599626-5cd8c2d3f853?q=80&w=1600&auto=format&fit=crop";
  const posterUrl = (series as { posterUrl?: string }).posterUrl || mediaObj.posterUrl || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop";

  const displayEpisodes = episodes.length > 0 ? episodes : [
    { id: "ep1", episode_number: 1, title: "The Cell", title_bn: "১৪৫ নম্বর সেল", description: "A locked cell is opened after 50 years to reveal a mysterious captive.", duration_minutes: 45 },
    { id: "ep2", episode_number: 2, title: "Anomalies", title_bn: "অনিয়ম", description: "Interrogations reveal impossible truths about the prisoner's identity.", duration_minutes: 48 },
    { id: "ep3", episode_number: 3, title: "The Trial", title_bn: "বিচার", description: "Conspiracies ignite within high command as secrets leak.", duration_minutes: 52 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      {/* Hero Backdrop Banner */}
      <div className="relative w-full h-[52vh] sm:h-[65vh] md:h-[74vh] max-h-[620px] min-h-[380px] flex items-end p-4 sm:p-8 md:p-12 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backdropUrl} alt={series.title} className="w-full h-full object-cover object-center filter brightness-90 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-600 font-extrabold text-[10px] sm:text-xs text-white uppercase tracking-wider shadow-md">
              BANGLA WEB SERIES
            </span>
            {series.rating && (
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                {series.rating} / 10
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-lg bg-white/15 text-xs font-bold text-neutral-200 border border-white/15">
              {series.release_year ?? 2024}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs">
              1080p Full HD
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none drop-shadow-md">
              {series.title}
            </h1>
            {series.title_bn && (
              <h2 className="text-base sm:text-xl md:text-2xl text-red-400 font-bold font-bengali drop-shadow-sm">{series.title_bn}</h2>
            )}
          </div>

          <p className="text-xs sm:text-sm text-neutral-200/90 leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl">
            {series.description || "Watch full episodes of this hit Bengali web series on PRO ACCESS MOVIE."}
          </p>

          <div className="flex items-center gap-2.5 sm:gap-3 pt-2 flex-wrap">
            <Link href={`/watch/series/${series.slug}`}>
              <Button variant="cinematic" size="lg" className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold px-6 sm:px-8 py-3 rounded-xl shadow-xl shadow-red-600/30 gap-2 min-h-[44px] text-xs sm:text-sm">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                <span>Play Episode 1</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="gap-2 font-bold rounded-xl min-h-[44px] text-xs sm:text-sm active:scale-95 text-white border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md"
            >
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add to My List</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
        {/* Mobile Compact Poster & Key Facts (Renders early on mobile) */}
        <div className="block md:hidden p-4 rounded-2xl bg-surface-raised border border-border/80 shadow-lg">
          <div className="flex gap-4">
            <div className="w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden bg-surface-base border border-border/80 shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterUrl} alt={series.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-text-muted">Release:</span>
                <strong className="text-text-primary font-bold">{series.release_year ?? 2024}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-text-muted">Rating:</span>
                <strong className="text-amber-500 font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> {series.rating ?? 8.5} / 10
                </strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-text-muted">Audio:</span>
                <strong className="text-text-primary font-bold">Bengali Original</strong>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-muted">Episodes:</span>
                <strong className="text-red-500 dark:text-red-400 font-mono font-bold">{displayEpisodes.length} Episodes</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Column: Episodes List */}
          <div className="md:col-span-2 space-y-6 sm:space-y-8">
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-surface-raised border border-border/80 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <h3 className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-5 w-5 text-red-500" />
                  <span>Season 1 Episodes ({displayEpisodes.length})</span>
                </h3>
              </div>

              <div className="space-y-3">
                {displayEpisodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-surface-base border border-border/80 hover:border-red-500/40 transition-all gap-3 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center font-black text-sm text-red-500 dark:text-red-400 shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        E{ep.episode_number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs sm:text-sm text-text-primary group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors truncate">
                          {ep.title}
                        </h4>
                        {ep.title_bn && (
                          <p className="text-[11px] text-red-500 dark:text-red-400 font-bengali truncate">{ep.title_bn}</p>
                        )}
                        {ep.description && (
                          <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{ep.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      {ep.duration_minutes && (
                        <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          {ep.duration_minutes}m
                        </span>
                      )}
                      <Link href={`/watch/series/${series.slug}?episode=${ep.id}`}>
                        <Button size="sm" variant="cinematic" className="bg-red-600 hover:bg-red-500 text-white font-extrabold gap-1.5 rounded-xl px-4 min-h-[38px] text-xs">
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Watch Now</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Panel */}
          <div className="hidden md:block space-y-6">
            <div className="p-5 rounded-3xl bg-surface-raised border border-border/80 space-y-4 text-xs shadow-xl">
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-surface-base border border-border/80 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={posterUrl} alt={series.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2.5 pt-3 border-t border-border/60 text-text-secondary">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-text-muted font-medium">Release Year:</span>
                  <strong className="text-text-primary font-bold">{series.release_year ?? 2024}</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-text-muted font-medium">User Rating:</span>
                  <strong className="text-amber-500 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {series.rating ?? 8.5} / 10
                  </strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-text-muted font-medium">Format:</span>
                  <strong className="text-text-primary font-bold">Bengali Web Series</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-text-muted font-medium">Episodes:</span>
                  <strong className="text-red-500 dark:text-red-400 font-bold">{displayEpisodes.length} Episodes</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-muted font-medium">Resolution:</span>
                  <strong className="text-emerald-500 dark:text-emerald-400 font-mono font-bold">1080p Full HD</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
