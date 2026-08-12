"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Plus, Check, Star, Calendar, Clock } from "lucide-react";
import { PublicContentItem } from "@/lib/content/public-catalog";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  item: PublicContentItem;
}

export function HeroBanner({ item }: HeroBannerProps) {
  const [inList, setInList] = useState(false);

  const watchHref = item.type === "movie" ? `/watch/movie/${item.slug}` : `/watch/series/${item.slug}`;
  const detailsHref = item.type === "movie" ? `/movies/${item.slug}` : `/series/${item.slug}`;

  return (
    <div className="relative w-full min-h-[480px] sm:min-h-[560px] lg:min-h-[620px] flex items-end rounded-3xl overflow-hidden bg-black border border-border shadow-2xl group select-none">
      {/* Hero Backdrop Image */}
      <Image
        src={item.backdrop_url || item.poster_url}
        alt={item.title}
        fill
        priority
        className="object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

      {/* Content Meta Container */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-4 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
            Featured {item.type === "movie" ? "Movie" : "Series"}
          </span>
          {item.rating && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              {item.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {item.title}
          </h1>
          {item.title_bn && <p className="text-lg sm:text-xl font-bold text-red-400">{item.title_bn}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-text-muted">
          {item.release_year && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {item.release_year}
            </span>
          )}
          {item.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {item.duration_minutes} min
            </span>
          )}
          {item.genres.length > 0 && (
            <span className="text-text-secondary font-medium">
              • {item.genres.slice(0, 3).join(", ")}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-text-secondary line-clamp-3 leading-relaxed max-w-xl">
          {item.overview || "Stream this title in high definition with FLEX Video Player on PRO ACCESS MOVIE."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href={watchHref}>
            <Button size="lg" variant="cinematic" className="gap-2 px-6 py-5 text-sm font-bold shadow-xl">
              <Play className="h-4 w-4 fill-current" /> Watch Now
            </Button>
          </Link>

          <Link href={detailsHref}>
            <Button size="lg" variant="ghost" className="gap-2 px-5 py-5 text-sm font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10">
              <Info className="h-4 w-4" /> Details
            </Button>
          </Link>

          <button
            onClick={() => setInList(!inList)}
            className={`p-3 rounded-xl border font-bold transition-all ${
              inList
                ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400"
                : "bg-black/60 hover:bg-white/10 border-white/20 text-white"
            }`}
          >
            {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
