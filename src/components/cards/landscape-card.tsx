"use client";

import { Play, Star } from "lucide-react";

export interface LandscapeCardProps {
  id: string;
  title: string;
  titleBn?: string | null;
  slug: string;
  type: "movie" | "series";
  backdropUrl: string;
  posterUrl?: string;
  releaseYear?: number | null;
  rating?: number | null;
  onClick?: () => void;
}

export function LandscapeCard({
  title,
  titleBn,
  backdropUrl,
  posterUrl,
  releaseYear,
  rating = 8.5,
  onClick,
}: LandscapeCardProps) {
  const displayTitle = titleBn || title;

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl bg-surface-raised border border-border overflow-hidden cursor-pointer hover:border-red-600/60 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block"
    >
      <div className="aspect-video w-full overflow-hidden bg-surface-base relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backdropUrl || posterUrl || ""}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-950/60 transform group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 space-y-1 z-10">
          <div className="flex items-center gap-2 text-[10px] text-text-muted font-semibold">
            {releaseYear && <span>{releaseYear}</span>}
            {rating && (
              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-current" /> {rating}
              </span>
            )}
          </div>
          <h3 className="text-sm font-extrabold text-text-primary group-hover:text-red-400 transition truncate">
            {displayTitle}
          </h3>
        </div>
      </div>
    </div>
  );
}
