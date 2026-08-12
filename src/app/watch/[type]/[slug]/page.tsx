import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Radio, Film, Star, Calendar, Clock, Info, ShieldCheck, Layers, Play } from "lucide-react";

import { getMovieBySlug, getRelatedMovies } from "@/lib/content/movies";
import { getSeriesBySlug, getSeriesSeasonsAndEpisodes } from "@/lib/content/series";
import { getPlaybackSourcesForMovie, getPlaybackSourcesForEpisode, PlaybackSource } from "@/lib/playback/sources";
import { FlexPlayer } from "@/components/player/flex-player";
import { updateWatchProgressAction } from "@/features/user/lib/history";
import { PosterCard } from "@/components/cards/poster-card";
import { Button } from "@/components/ui/button";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { type, slug } = await params;

  let title = "Streaming Media";
  let titleBn: string | null = null;
  let synopsis = "";
  let synopsisBn: string | null = null;
  let releaseYear = 2024;
  let rating = 8.8;
  let isBengali = true;
  let contentId = "";
  let contentKind: "movie" | "episode" = "movie";
  let sources: PlaybackSource[] = [];
  let related: any[] = [];
  let seriesEpisodes: any[] = [];

  if (type === "movie") {
    const movie = await getMovieBySlug(slug);
    if (!movie) notFound();
    title = movie.title;
    titleBn = movie.title_bn;
    synopsis = movie.description || "A gripping heist drama following Masud, an electrician whose desperation leads him to build a tunnel beneath a bank vault.";
    synopsisBn = movie.description_bn;
    releaseYear = movie.release_year || 2023;
    rating = movie.rating || 8.8;
    isBengali = (movie as any).isBengali ?? true;
    contentId = movie.id;
    contentKind = "movie";
    sources = await getPlaybackSourcesForMovie(movie.id);
    related = await getRelatedMovies(movie.id, 6);
  } else if (type === "series") {
    const series = await getSeriesBySlug(slug);
    if (!series) notFound();
    const { episodes } = await getSeriesSeasonsAndEpisodes(series.id);
    const targetEp = episodes[0];
    title = series.title;
    titleBn = series.title_bn;
    synopsis = series.description || "Watch full episodes of this hit Bengali web series on PRO ACCESS MOVIE.";
    synopsisBn = series.description_bn;
    releaseYear = series.release_year || 2022;
    rating = series.rating || 9.2;
    isBengali = (series as any).isBengali ?? true;

    if (targetEp) {
      contentId = targetEp.id;
      contentKind = "episode";
      sources = await getPlaybackSourcesForEpisode(targetEp.id);
    } else {
      contentId = series.id;
      sources = await getPlaybackSourcesForMovie(series.id);
    }

    seriesEpisodes = episodes.length > 0 ? episodes : [
      { id: "ep1", episode_number: 1, title: "The Cell", title_bn: "১৪৫ নম্বর সেল", duration_minutes: 45 },
      { id: "ep2", episode_number: 2, title: "Anomalies", title_bn: "অনিয়ম", duration_minutes: 48 },
      { id: "ep3", episode_number: 3, title: "The Trial", title_bn: "বিচার", duration_minutes: 52 },
    ];
  } else {
    notFound();
  }

  // Fallback demo source if empty
  if (sources.length === 0) {
    sources = [
      {
        id: "src_1080p",
        label: "PRO ACCESS FastCDN — 1080p Full HD",
        providerName: "PRO ACCESS HighSpeed Dhaka CDN",
        format: "mp4",
        quality: "1080p",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        priority: 1,
      },
      {
        id: "src_720p",
        label: "PRO ACCESS Edge — 720p HD",
        providerName: "PRO ACCESS Global Edge CDN",
        format: "mp4",
        quality: "720p",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        priority: 2,
      },
    ];
  }

  const handlePositionUpdate = async (progressSeconds: number, durationSeconds: number) => {
    "use server";
    if (contentId) {
      await updateWatchProgressAction(contentId, contentKind, progressSeconds, durationSeconds);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* 1. TOP HEADER BAR */}
      <header className="sticky top-0 z-30 px-4 md:px-8 py-3 bg-black/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition cursor-pointer text-xs font-bold text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Player</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-base md:text-lg font-black tracking-widest text-red-600">
            PRO ACCESS <span className="text-white">STREAM</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-400 font-mono font-bold uppercase">
            LIVE ENGINE
          </span>
        </div>
      </header>

      {/* 2. CINEMATIC VIDEO PLAYER STAGE */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 md:p-6 space-y-6">
        <div className="w-full">
          <FlexPlayer
            title={title}
            sources={sources}
            autoPlay={true}
            onPositionUpdate={handlePositionUpdate}
          />
        </div>

        {/* 3. CONTENT METADATA & PANELS */}
        <div className="space-y-6 px-2">
          {/* Title Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-white">{title}</h1>
                {titleBn && (
                  <span className="text-lg md:text-xl text-red-400 font-bold font-bengali">
                    ({titleBn})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  {releaseYear}
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 border border-white/10 font-bold text-amber-400 text-[11px] flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {rating} / 10
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-300">
                  {isBengali ? "Bengali Original" : "Dual Audio"}
                </span>
              </div>
            </div>
          </div>

          {/* Details Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <p className="text-sm leading-relaxed text-neutral-300">{synopsis}</p>
              {synopsisBn && (
                <p className="text-xs leading-relaxed text-red-400 font-bengali">{synopsisBn}</p>
              )}

              {/* Episodes List (if Series) */}
              {type === "series" && seriesEpisodes.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-red-500" />
                    <span>Season 1 Episodes</span>
                  </h3>
                  <div className="space-y-2">
                    {seriesEpisodes.map((ep: any) => (
                      <div
                        key={ep.id}
                        className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-red-500">E{ep.episode_number}</span>
                          <span className="font-bold text-white">{ep.title}</span>
                          {ep.title_bn && <span className="text-neutral-400 font-bengali">({ep.title_bn})</span>}
                        </div>
                        <span className="text-neutral-500">{ep.duration_minutes || 45} mins</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Security & Sources */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4 h-fit text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-400 pb-2 border-b border-white/10">
                <ShieldCheck className="w-4 h-4" />
                <span>PRO ACCESS Authorized Stream</span>
              </div>
              <div className="space-y-2 text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Encryption:</span>
                  <span className="font-semibold text-emerald-400">AES-128 HLS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Active Mirrors:</span>
                  <span className="font-semibold text-white">{sources.length} CDNs</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-[11px] font-bold text-neutral-400 uppercase">CDN Sources</p>
                {sources.map((s) => (
                  <div key={s.id} className="p-2 rounded bg-neutral-950 border border-white/10 text-[11px] space-y-0.5">
                    <div className="flex justify-between font-bold text-white">
                      <span>{s.providerName}</span>
                      <span className="text-red-400">{s.quality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Section */}
          {related.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-white/10">
              <h3 className="text-sm font-bold text-white tracking-wider uppercase">More Like This</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {related.map((rel) => (
                  <PosterCard
                    key={rel.id}
                    id={rel.id}
                    title={rel.title}
                    titleBn={rel.titleBn}
                    slug={rel.slug}
                    type="movie"
                    posterUrl={rel.posterUrl}
                    releaseYear={rel.releaseYear}
                    rating={rel.rating}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
