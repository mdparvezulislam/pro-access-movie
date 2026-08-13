"use client";

import Link from "next/link";
import { Play, Info, Star, Plus, Check } from "lucide-react";

export interface HeroItem {
  id: string;
  title: string;
  titleBn?: string | null;
  slug: string;
  type: "movie" | "series";
  description?: string | null;
  releaseYear?: number | null;
  durationMinutes?: number | null;
  rating?: number | null;
  backdropUrl?: string | null;
  posterUrl?: string | null;
}

interface HeroBannerProps {
  item?: HeroItem;
  isInWatchlist?: boolean;
  onToggleWatchlist?: () => void;
}

export function HeroBanner({ item, isInWatchlist = false, onToggleWatchlist }: HeroBannerProps) {
  const title = item?.title || "PRO ACCESS MOVIE Featured";
  const titleBn = item?.titleBn || null;
  const description =
    item?.description ||
    "Watch high-definition Bengali hits, blockbuster cinema, and exclusive TV series on PRO ACCESS MOVIE.";
  const backdropUrl =
    item?.backdropUrl ||
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop";
  const rating = item?.rating || 8.8;

  const watchHref = item ? `/watch/${item.type}/${item.slug}` : "/watch/movie/surongo";
  const detailsHref = item ? `/movies/${item.slug}` : "/movies/surongo";

  return (
    <section className="relative w-full h-[56vh] sm:h-[68vh] md:h-[76vh] max-h-[640px] min-h-[420px] flex items-end p-4 sm:p-8 md:p-12 pb-8 sm:pb-12 overflow-hidden rounded-2xl sm:rounded-3xl bg-black border border-border/40 shadow-2xl">
      {/* Backdrop Artwork */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover object-center filter brightness-90 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
      </div>

      {/* Content Metadata */}
      <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="bg-red-600 px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-white shadow-md">
            #1 IN BANGLADESH TODAY
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 tracking-wider">98% Match</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] sm:text-xs text-neutral-200 backdrop-blur-sm border border-white/15">
            4K Ultra HD
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{rating}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight sm:leading-none drop-shadow-md">
            {title}
          </h1>
          {titleBn && (
            <h2 className="text-base sm:text-xl md:text-2xl text-red-400 font-bold font-bengali drop-shadow-sm">{titleBn}</h2>
          )}
        </div>

        <p className="text-xs sm:text-sm text-neutral-200/90 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
          {description}
        </p>

        <div className="flex items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2 flex-wrap">
          <Link
            href={watchHref}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition shadow-xl shadow-red-600/30 min-h-[44px]"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            <span>Play Now</span>
          </Link>

          <Link
            href={detailsHref}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs sm:text-sm border border-white/25 backdrop-blur-md transition min-h-[44px]"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>More Info</span>
          </Link>

          {onToggleWatchlist && (
            <button
              onClick={onToggleWatchlist}
              className="p-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white transition border border-white/25 backdrop-blur-md cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Add to Watchlist"
            >
              {isInWatchlist ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
