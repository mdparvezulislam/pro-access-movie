import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getSeriesBySlug, getSeriesSeasonsAndEpisodes } from "@/lib/content/series";
import { Play, Star, Bookmark, Layers } from "lucide-react";
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

  const displayEpisodes = episodes.length > 0 ? episodes : [
    { id: "ep1", episode_number: 1, title: "The Cell", title_bn: "১৪৫ নম্বর সেল", description: "A locked cell is opened after 50 years to reveal a mysterious captive.", duration_minutes: 45 },
    { id: "ep2", episode_number: 2, title: "Anomalies", title_bn: "অনিয়ম", description: "Interrogations reveal impossible truths about the prisoner's identity.", duration_minutes: 48 },
    { id: "ep3", episode_number: 3, title: "The Trial", title_bn: "বিচার", description: "Conspiracies ignite within high command as secrets leak.", duration_minutes: 52 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      {/* Hero Backdrop */}
      <div className="relative w-full h-[60vh] md:h-[72vh] flex items-end p-4 md:p-12 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backdropUrl} alt={series.title} className="w-full h-full object-cover filter brightness-90 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded bg-red-600 font-extrabold text-[10px] text-white uppercase tracking-wider">
              BANGLA WEB SERIES
            </span>
            {series.rating && (
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                {series.rating} / 10
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded bg-white/10 text-xs font-bold text-neutral-300 border border-white/10">
              {series.release_year ?? 2022}
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight leading-none">
              {series.title}
            </h1>
            {series.title_bn && (
              <h2 className="text-xl md:text-2xl text-red-400 font-bold font-bengali">{series.title_bn}</h2>
            )}
          </div>

          <p className="text-xs md:text-sm text-neutral-300 leading-relaxed line-clamp-3 max-w-2xl">
            {series.description || "Watch full episodes of this hit Bengali web series on PRO ACCESS MOVIE."}
          </p>

          <div className="flex items-center gap-3 pt-3 flex-wrap">
            <Link href={`/watch/series/${series.slug}`}>
              <Button variant="cinematic" size="lg" className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-8 shadow-xl shadow-red-600/30 gap-2">
                <Play className="w-5 h-5 fill-current" />
                <span>Play Episode 1</span>
              </Button>
            </Link>

            <Button variant="outline" size="lg" className="gap-2 font-bold text-white border-white/20">
              <Bookmark className="w-5 h-5" />
              <span>Add to My List</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 md:px-12 py-10 space-y-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
              <Layers className="h-5 w-5 text-red-500" />
              <span>Season 1 Episodes</span>
            </h3>
          </div>

          <div className="space-y-3">
            {displayEpisodes.map((ep) => (
              <div
                key={ep.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-surface-raised border border-border hover:border-red-600/60 transition-all gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center font-black text-sm text-red-500 shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    E{ep.episode_number}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary group-hover:text-red-400 transition-colors">
                      {ep.title}
                    </h4>
                    {ep.title_bn && (
                      <p className="text-xs text-red-400 font-bengali">{ep.title_bn}</p>
                    )}
                    {ep.description && (
                      <p className="text-xs text-text-muted mt-1 line-clamp-1">{ep.description}</p>
                    )}
                  </div>
                </div>

                <Link href={`/watch/series/${series.slug}`}>
                  <Button variant="cinematic" size="sm" className="bg-red-600 hover:bg-red-500 text-white font-bold gap-2 shrink-0">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Watch Now</span>
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
