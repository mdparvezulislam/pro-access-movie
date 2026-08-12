import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getSeriesBySlug, getSeriesSeasonsAndEpisodes } from "@/lib/content/series";
import { Play, Star, Calendar, Bookmark, Tv, Layers } from "lucide-react";
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

  const { seasons, episodes } = await getSeriesSeasonsAndEpisodes(series.id);
  const mediaObj = (series.media as Record<string, string>) || {};
  const backdropUrl = mediaObj.backdropUrl || null;
  const posterUrl = mediaObj.posterUrl || null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* Hero Backdrop Spotlight */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] bg-surface-raised overflow-hidden">
        {backdropUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={backdropUrl} alt={series.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-text-muted bg-surface-base">
            <Tv className="h-20 w-20 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

        {/* Floating Header Details */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 flex flex-col sm:flex-row items-end gap-6 z-10">
          <div className="hidden sm:block w-44 shrink-0 rounded-2xl overflow-hidden border-2 border-border shadow-2xl bg-card aspect-[2/3]">
            {posterUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={posterUrl} alt={series.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-text-muted">
                <Tv className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 font-bold text-[10px] text-white uppercase">
                Web Series
              </span>
              {series.rating && (
                <span className="px-2 py-0.5 rounded bg-black/80 text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {series.rating}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight leading-none">
              {series.title}
            </h1>
            {series.title_bn && (
              <h2 className="text-xl font-bold text-red-400 font-bengali">{series.title_bn}</h2>
            )}

            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {series.release_year ?? "2026"}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                {seasons.length} Season(s) • {episodes.length} Episodes
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {episodes[0] && (
                <Link href={`/watch/series/${series.slug}`}>
                  <Button variant="cinematic" size="lg" className="gap-2 text-sm shadow-xl shadow-red-950/40">
                    <Play className="h-5 w-5 fill-current" />
                    <span>Start S1:E1</span>
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="lg" className="gap-2 text-sm border-border text-text-primary">
                <Bookmark className="h-4 w-4" />
                <span>Add to List</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Season & Episode List Section */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Layers className="h-5 w-5 text-red-500" />
              <span>Seasons & Episodes</span>
            </h3>
          </div>

          <div className="space-y-3">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface-base border border-border hover:bg-surface-raised transition-all gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center font-bold text-sm text-red-500 shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    E{ep.episode_number}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary group-hover:text-red-500 transition-colors">
                      {ep.title}
                    </h4>
                    {ep.title_bn && (
                      <p className="text-xs text-text-muted font-bengali">{ep.title_bn}</p>
                    )}
                    {ep.description && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-1">{ep.description}</p>
                    )}
                  </div>
                </div>

                <Link href={`/watch/series/${series.slug}`}>
                  <Button variant="cinematic" size="sm" className="gap-2 text-xs shrink-0">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Play Episode</span>
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
