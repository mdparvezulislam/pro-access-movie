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
  const title = item?.title || "Surongo";
  const titleBn = item?.titleBn || "সুরঙ্গ";
  const description =
    item?.description ||
    "A gripping heist drama following Masud, an electrician whose desperation leads him to build a tunnel beneath a bank vault.";
  const backdropUrl =
    item?.backdropUrl ||
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop";
  const rating = item?.rating || 8.8;

  const watchHref = item ? `/watch/${item.type}/${item.slug}` : "/watch/movie/surongo";
  const detailsHref = item ? `/movies/${item.slug}` : "/movies/surongo";

  return (
    <section className="relative w-full h-[68vh] md:h-[82vh] flex items-end pb-16 px-4 md:px-12 overflow-hidden rounded-3xl bg-black border border-border-muted shadow-2xl">
      {/* Backdrop Artwork */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover object-center filter brightness-90 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </div>

      {/* Content Metadata */}
      <div className="relative z-10 max-w-2xl space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="bg-red-600 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md">
            #1 IN BANGLADESH TODAY
          </span>
          <span className="text-xs font-medium text-emerald-400 tracking-wider">98% Match</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-neutral-300 backdrop-blur-sm border border-white/10">
            4K Ultra HD
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{rating}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white leading-none">
            {title}
          </h1>
          {titleBn && (
            <h2 className="text-xl md:text-2xl text-red-400 font-bold font-bengali">{titleBn}</h2>
          )}
        </div>

        <p className="text-xs md:text-sm text-neutral-300 line-clamp-3 leading-relaxed max-w-xl">
          {description}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <Link
            href={watchHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm transition shadow-xl shadow-red-600/30"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Play Now</span>
          </Link>

          <Link
            href={detailsHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition"
          >
            <Info className="w-5 h-5" />
            <span>More Info</span>
          </Link>

          {onToggleWatchlist && (
            <button
              onClick={onToggleWatchlist}
              className="p-3.5 rounded-xl bg-white/20 backdrop-blur-lg text-white hover:bg-white/30 transition border border-white/20 cursor-pointer"
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
