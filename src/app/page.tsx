import Link from "next/link";
import { Sparkles, Tv, Flame, Clapperboard, Compass, Award, Heart, Clock } from "lucide-react";

import { Navbar } from "@/components/common/navbar";
import { HeroBanner } from "@/components/common/hero-banner";
import { ContentRail } from "@/components/common/content-rail";
import { PosterCard } from "@/components/cards/poster-card";
import { RankedCard } from "@/components/cards/ranked-card";
import { LandscapeCard } from "@/components/cards/landscape-card";
import { Footer } from "@/components/common/footer";
import { getPublishedMovies } from "@/lib/content/movies";
import { getPublishedSeries } from "@/lib/content/series";
import { DEMO_GENRES } from "@/lib/content/catalog-fallback";
import { getContinueWatching } from "@/features/user/lib/history";
import { evaluateAd } from "@/lib/ads/ad-engine";
import { AdBanner } from "@/components/ads/ad-banner";

export default async function HomePage() {
  const [movies, seriesList, continueWatching, adResult] = await Promise.all([
    getPublishedMovies({ limit: 30 }),
    getPublishedSeries({ limit: 20 }),
    getContinueWatching(),
    evaluateAd("home_hero_banner"),
  ]);

  const featured = movies[0];
  const heroItem = featured
    ? {
        id: featured.id,
        title: featured.title,
        titleBn: featured.title_bn,
        slug: featured.slug,
        type: "movie" as const,
        description: featured.description,
        releaseYear: featured.release_year,
        durationMinutes: featured.duration_minutes,
        rating: featured.rating,
        backdropUrl: featured.backdropUrl,
        posterUrl: featured.posterUrl,
      }
    : undefined;

  const top10 = movies.slice(0, 10);
  const banglaMovies = movies.filter((m) => Boolean(m.title_bn));
  const trendingMovies = movies.filter((m) => (m.rating || 0) >= 8.5);
  const topRatedMovies = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  const recentlyAdded = [...movies].sort((a, b) => (b.release_year || 2024) - (a.release_year || 2024)).slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-16 space-y-6 sm:space-y-10">
        {/* 1. CINEMATIC HERO BANNER */}
        <HeroBanner item={heroItem} />

        {/* 2. AD SLOT — HOME HERO */}
        {adResult.creative && (
          <AdBanner
            title={adResult.creative.title}
            mediaUrl={adResult.creative.mediaUrl}
            destinationUrl={adResult.creative.destinationUrl}
            ctaText={adResult.creative.ctaText}
          />
        )}

        {/* 3. CONTINUE WATCHING RAIL */}
        {continueWatching.length > 0 && (
          <ContentRail
            title="Continue Watching"
            subtitle="Pick up right where you left off"
            icon={<Clock className="w-5 h-5 text-red-500" />}
            seeAllHref="/continue-watching"
          >
            {continueWatching.map((item) => (
              <div key={item.id} className="w-[135px] sm:w-[170px] md:w-[200px] shrink-0">
                <PosterCard
                  id={item.id}
                  title={item.title}
                  titleBn={item.titleBn}
                  slug={item.slug}
                  type={item.type}
                  posterUrl={item.posterUrl || ""}
                  releaseYear={item.releaseYear}
                  rating={item.rating}
                  badgeText="RESUME"
                />
              </div>
            ))}
          </ContentRail>
        )}

        {/* 4. GENRES QUICK SELECTOR BAR */}
        <div className="space-y-3 py-1">
          <div className="flex items-center justify-between text-xs font-bold text-text-muted uppercase tracking-widest px-1">
            <span className="flex items-center gap-1.5 text-red-500">
              <Compass className="w-4 h-4" />
              <span>Browse Categories</span>
            </span>
            <Link
              href="/genres"
              className="text-text-secondary hover:text-red-500 transition cursor-pointer text-xs font-bold px-2 py-1 rounded-lg hover:bg-surface-raised"
            >
              View All ›
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar px-0.5">
            {DEMO_GENRES.map((g) => (
              <Link
                key={g.id}
                href={`/genres?name=${encodeURIComponent(g.name)}`}
                className="px-4 py-2 rounded-xl sm:rounded-2xl bg-surface-raised border border-border/80 hover:border-red-500/60 text-xs font-bold text-text-secondary hover:text-text-primary transition shrink-0 cursor-pointer backdrop-blur-md shadow-sm min-h-[40px] flex items-center justify-center"
              >
                {g.name_bn || g.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 5. TOP 10 IN BANGLADESH RANKED RAIL */}
        {top10.length > 0 && (
          <ContentRail
            title="Top 10 in Bangladesh Today"
            icon={<Flame className="w-5 h-5 text-red-500" />}
            seeAllHref="/movies"
          >
            {top10.map((movie, index) => (
              <RankedCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                titleBn={movie.title_bn}
                slug={movie.slug}
                type="movie"
                posterUrl={movie.posterUrl}
                rank={index + 1}
              />
            ))}
          </ContentRail>
        )}

        {/* 6. BANGLADESH FAVORITES RAIL */}
        {banglaMovies.length > 0 && (
          <ContentRail
            title="Bangladesh Favorites"
            subtitle="Blockbuster Bengali cinema & hit films"
            icon={<Heart className="w-5 h-5 text-red-500" />}
            seeAllHref="/movies"
          >
            {banglaMovies.map((movie) => (
              <div key={movie.id} className="w-[135px] sm:w-[170px] md:w-[200px] shrink-0">
                <PosterCard
                  id={movie.id}
                  title={movie.title}
                  titleBn={movie.title_bn}
                  slug={movie.slug}
                  type="movie"
                  posterUrl={movie.posterUrl}
                  releaseYear={movie.release_year}
                  rating={movie.rating}
                  badgeText="BANGLA"
                />
              </div>
            ))}
          </ContentRail>
        )}

        {/* 7. TRENDING NOW RAIL */}
        {trendingMovies.length > 0 && (
          <ContentRail
            title="Trending Now"
            icon={<Sparkles className="w-5 h-5 text-red-500" />}
            seeAllHref="/movies"
          >
            {trendingMovies.map((movie) => (
              <div key={movie.id} className="w-[135px] sm:w-[170px] md:w-[200px] shrink-0">
                <PosterCard
                  id={movie.id}
                  title={movie.title}
                  titleBn={movie.title_bn}
                  slug={movie.slug}
                  type="movie"
                  posterUrl={movie.posterUrl}
                  releaseYear={movie.release_year}
                  rating={movie.rating}
                />
              </div>
            ))}
          </ContentRail>
        )}

        {/* 8. POPULAR TV & DRAMA SERIES RAIL */}
        {seriesList.length > 0 && (
          <ContentRail
            title="Popular TV & Drama Series"
            icon={<Tv className="w-5 h-5 text-red-500" />}
            seeAllHref="/series"
          >
            {seriesList.map((series) => (
              <div key={series.id} className="w-[135px] sm:w-[170px] md:w-[200px] shrink-0">
                <PosterCard
                  id={series.id}
                  title={series.title}
                  titleBn={series.title_bn}
                  slug={series.slug}
                  type="series"
                  posterUrl={(series as { posterUrl?: string }).posterUrl || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop"}
                  releaseYear={series.release_year}
                  rating={series.rating}
                  badgeText="SERIES"
                />
              </div>
            ))}
          </ContentRail>
        )}

        {/* 9. TOP RATED CINEMA RAIL */}
        {topRatedMovies.length > 0 && (
          <ContentRail
            title="Top Rated Cinema"
            icon={<Award className="w-5 h-5 text-amber-500" />}
            seeAllHref="/movies"
          >
            {topRatedMovies.map((movie) => (
              <div key={movie.id} className="w-[135px] sm:w-[170px] md:w-[200px] shrink-0">
                <PosterCard
                  id={movie.id}
                  title={movie.title}
                  titleBn={movie.title_bn}
                  slug={movie.slug}
                  type="movie"
                  posterUrl={movie.posterUrl}
                  releaseYear={movie.release_year}
                  rating={movie.rating}
                />
              </div>
            ))}
          </ContentRail>
        )}

        {/* 10. RECENTLY ADDED RAIL */}
        {recentlyAdded.length > 0 && (
          <ContentRail
            title="Recently Added"
            icon={<Clock className="w-5 h-5 text-emerald-500" />}
            seeAllHref="/movies"
          >
            {recentlyAdded.map((movie) => (
              <div key={movie.id} className="w-[135px] sm:w-[170px] md:w-[200px] shrink-0">
                <PosterCard
                  id={movie.id}
                  title={movie.title}
                  titleBn={movie.title_bn}
                  slug={movie.slug}
                  type="movie"
                  posterUrl={movie.posterUrl}
                  releaseYear={movie.release_year}
                  rating={movie.rating}
                  badgeText="NEW"
                />
              </div>
            ))}
          </ContentRail>
        )}

        {/* 11. FEATURED LANDSCAPE PREVIEWS RAIL */}
        <ContentRail
          title="Featured Previews"
          icon={<Clapperboard className="w-5 h-5 text-red-500" />}
          seeAllHref="/movies"
        >
          {movies.slice(0, 8).map((item) => (
            <div key={item.id} className="w-[240px] sm:w-[290px] md:w-[330px] shrink-0">
              <LandscapeCard
                id={item.id}
                title={item.title}
                titleBn={item.title_bn}
                slug={item.slug}
                type="movie"
                backdropUrl={item.backdropUrl}
                posterUrl={item.posterUrl}
                releaseYear={item.release_year}
                rating={item.rating}
              />
            </div>
          ))}
        </ContentRail>
      </main>

      <Footer />
    </div>
  );
}
