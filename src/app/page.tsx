import { Navbar } from "@/components/common/navbar";
import { HeroBanner } from "@/components/common/hero-banner";
import { ContentRail } from "@/components/common/content-rail";
import { Footer } from "@/components/common/footer";
import { getPublishedMovies } from "@/lib/content/movies";
import { getPublishedSeries } from "@/lib/content/series";
import { getContinueWatching } from "@/features/user/lib/history";
import { getUserWatchlist } from "@/features/user/lib/watchlist";
import { evaluateAd } from "@/lib/ads/ad-engine";
import { AdBanner } from "@/components/ads/ad-banner";

export default async function HomePage() {
  const [movies, seriesList, continueWatching, watchlist, adResult] = await Promise.all([
    getPublishedMovies({ limit: 10 }),
    getPublishedSeries({ limit: 10 }),
    getContinueWatching(),
    getUserWatchlist(),
    evaluateAd("home_hero_banner"),
  ]);

  const movieRailItems = movies.map((m) => ({
    id: m.id,
    title: m.title,
    titleBn: m.title_bn,
    slug: m.slug,
    type: "movie" as const,
    status: m.status,
    releaseYear: m.release_year,
    durationMinutes: m.duration_minutes,
    rating: m.rating,
    posterUrl: m.posterUrl,
    backdropUrl: m.backdropUrl,
  }));

  const seriesRailItems = seriesList.map((s) => ({
    id: s.id,
    title: s.title,
    titleBn: s.title_bn,
    slug: s.slug,
    type: "series" as const,
    status: s.status,
    releaseYear: s.release_year,
    durationMinutes: null,
    rating: s.rating,
    posterUrl: (s.media as Record<string, string>)?.posterUrl || null,
    backdropUrl: (s.media as Record<string, string>)?.backdropUrl || null,
  }));

  const heroItem = movies[0] ? {
    id: movies[0].id,
    title: movies[0].title,
    titleBn: movies[0].title_bn || undefined,
    slug: movies[0].slug,
    type: "movie" as const,
    description: movies[0].description || "Stream the best in Bengali and international cinema.",
    releaseYear: movies[0].release_year || 2026,
    durationMinutes: movies[0].duration_minutes || 120,
    rating: movies[0].rating || 8.5,
    backdropUrl: movies[0].backdropUrl,
    posterUrl: movies[0].posterUrl,
  } : undefined;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-6">
        <HeroBanner item={heroItem} />

        <div className="space-y-6">
          {continueWatching.length > 0 && (
            <ContentRail
              title="Continue Watching"
              subtitle="Pick up right where you left off"
              items={continueWatching}
            />
          )}

          {watchlist.length > 0 && (
            <ContentRail
              title="My List"
              subtitle="Saved movies & series in your library"
              items={watchlist}
            />
          )}

          <ContentRail
            title="Trending Movies"
            subtitle="Most watched titles across Bangladesh today"
            items={movieRailItems}
          />

          {adResult.creative && (
            <AdBanner
              title={adResult.creative.title}
              mediaUrl={adResult.creative.mediaUrl}
              destinationUrl={adResult.creative.destinationUrl}
              ctaText={adResult.creative.ctaText}
            />
          )}

          <ContentRail
            title="Bengali Exclusive Series"
            subtitle="Original web series & high-definition drama"
            items={seriesRailItems}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
