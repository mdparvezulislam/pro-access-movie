import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Film, Tv } from "lucide-react";
import { getMovieBySlug, getSeriesBySlug, PlaybackSourceItem, DownloadSourceItem, PublicContentItem } from "@/lib/content/public-catalog";
import { FlexVideoPlayer } from "@/components/player/FlexVideoPlayer";
import { ContentCard } from "@/components/content/ContentCard";

interface WatchPageProps {
  params: Promise<{
    type: string;
    slug: string;
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

export default async function WatchPage({ params }: WatchPageProps) {
  const { type, slug } = await params;
  const isMovie = type === "movie";

  let title = "";
  let contentId = "";
  let posterUrl = "";
  let playbackSources: PlaybackSourceItem[] = [];
  let downloadSources: DownloadSourceItem[] = [];
  let backHref = "/";
  let relatedItems: PublicContentItem[] = [];

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
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Back Bar */}
      <div className="flex items-center justify-between">
        <Link href={backHref} className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors">
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

      {/* Downloads Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-400" /> Fast Download Links ({downloadSources.length})
          </h3>
          {downloadSources.length === 0 ? (
            <p className="text-xs text-text-muted">No direct download links available yet.</p>
          ) : (
            <div className="space-y-2">
              {downloadSources.map((d) => (
                <a
                  key={d.id}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-surface-raised border border-border hover:border-emerald-500/50 flex items-center justify-between text-xs font-semibold transition-colors"
                >
                  <span className="text-text-primary">{d.label}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">{d.quality}</span>
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
