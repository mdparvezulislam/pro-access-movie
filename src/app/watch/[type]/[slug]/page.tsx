import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Film, Tv, Play, Layers } from "lucide-react";
import {
  getMovieBySlug,
  getSeriesBySlug,
  getEpisodeSources,
  PlaybackSourceItem,
  DownloadSourceItem,
  PublicContentItem,
} from "@/lib/content/public-catalog";
import { FlexVideoPlayer } from "@/components/player/FlexVideoPlayer";
import { ContentCard } from "@/components/content/ContentCard";

interface WatchPageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
  searchParams?: Promise<{
    episode?: string;
  }>;
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { type, slug } = await params;
  if (type === "movie") {
    const { movie } = await getMovieBySlug(slug);
    return { title: movie ? `Watch ${movie.title} — FLEX Player` : "Watch Movie" };
  } else {
    const { series } = await getSeriesBySlug(slug);
    return { title: series ? `Watch ${series.title} — FLEX Player` : "Watch Series" };
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { type, slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const requestedEpisodeId = sParams.episode;
  const isMovie = type === "movie";

  let title = "";
  let contentId = "";
  let posterUrl = "";
  let playbackSources: PlaybackSourceItem[] = [];
  let downloadSources: DownloadSourceItem[] = [];
  let backHref = "/";
  let relatedItems: PublicContentItem[] = [];

  // Series specific episodes data
  let seriesSeasons: {
    id: string;
    season_number: number;
    title?: string | null;
    episodes: { id: string; episode_number: number; title: string; title_bn?: string | null; duration_minutes?: number | null }[];
  }[] = [];
  let currentEpisodeId = "";

  if (isMovie) {
    const res = await getMovieBySlug(slug);
    if (!res.movie) notFound();
    title = res.movie.title;
    contentId = res.movie.id;
    posterUrl = res.movie.poster_url;
    playbackSources = res.playbackSources;
    downloadSources = res.downloadSources;
    relatedItems = res.relatedMovies;
    backHref = `/movies/${slug}`;
  } else {
    const res = await getSeriesBySlug(slug);
    if (!res.series) notFound();
    title = res.series.title;
    contentId = res.series.id;
    posterUrl = res.series.poster_url;
    relatedItems = res.relatedSeries;
    backHref = `/series/${slug}`;
    seriesSeasons = res.series.seasons || [];

    const allEpisodes = seriesSeasons.flatMap((s) => s.episodes);
    const activeEpisode = requestedEpisodeId
      ? allEpisodes.find((e) => e.id === requestedEpisodeId) || allEpisodes[0]
      : allEpisodes[0];

    if (activeEpisode) {
      currentEpisodeId = activeEpisode.id;
      title = `${res.series.title} — E${activeEpisode.episode_number}: ${activeEpisode.title}`;
      const epSources = await getEpisodeSources(activeEpisode.id);
      playbackSources = epSources.playbackSources;
      downloadSources = epSources.downloadSources;
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Back Bar */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Details
        </Link>
        <span className="px-3 py-1 rounded-full bg-red-600/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          {isMovie ? <Film className="h-3.5 w-3.5" /> : <Tv className="h-3.5 w-3.5" />}
          FLEX Player
        </span>
      </div>

      {/* Custom Flex Player */}
      <FlexVideoPlayer
        title={title}
        contentId={contentId}
        slug={slug}
        type={isMovie ? "movie" : "series"}
        posterUrl={posterUrl}
        sources={playbackSources}
      />

      {/* TV Series Episode Selection Grid */}
      {!isMovie && seriesSeasons.length > 0 && (
        <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Layers className="h-4 w-4 text-red-500" /> Season & Episode Selection
            </h3>
            <span className="text-xs text-text-muted font-mono">
              {seriesSeasons.reduce((acc, s) => acc + s.episodes.length, 0)} Total Episodes
            </span>
          </div>

          <div className="space-y-6">
            {seriesSeasons.map((season) => (
              <div key={season.id} className="space-y-3">
                <h4 className="text-xs font-extrabold text-red-400 uppercase tracking-wider">
                  Season {season.season_number} {season.title && `— ${season.title}`}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {season.episodes.map((ep) => {
                    const isActive = ep.id === currentEpisodeId;
                    return (
                      <Link
                        key={ep.id}
                        href={`/watch/series/${slug}?episode=${ep.id}`}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 text-xs font-semibold ${
                          isActive
                            ? "bg-red-600/20 border-red-500/50 text-white font-extrabold shadow-lg shadow-red-600/10"
                            : "bg-surface-raised border-border text-text-secondary hover:text-text-primary hover:border-red-600/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              isActive ? "bg-red-600 text-white" : "bg-surface-base text-text-muted"
                            }`}
                          >
                            E{ep.episode_number}
                          </span>
                          <span className="truncate">{ep.title}</span>
                        </div>

                        {isActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-600 text-white uppercase">
                            Now Playing
                          </span>
                        ) : (
                          <Play className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Downloads Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-400" /> Fast Download Links ({downloadSources.length})
          </h3>
          {downloadSources.length === 0 ? (
            <p className="text-xs text-text-muted">No direct download links available for this item yet.</p>
          ) : (
            <div className="space-y-2">
              {downloadSources.map((d) => (
                <a
                  key={d.id}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-surface-raised border border-border hover:border-emerald-500/50 flex items-center justify-between text-xs font-semibold transition-all group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-text-primary group-hover:text-emerald-400 transition-colors truncate">
                      {d.label}
                    </span>
                    {d.language && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-surface-base text-text-muted">
                        {d.language}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                    {d.quality}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Content */}
      {relatedItems.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border">
          <h2 className="text-lg font-bold text-text-primary">More Content Like This</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedItems.map((rel) => (
              <ContentCard key={rel.id} item={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
