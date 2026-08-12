"use client";

import Link from "next/link";
import { Star, Play } from "lucide-react";

export interface PosterCardProps {
  id: string;
  title: string;
  titleBn?: string | null;
  slug: string;
  type: "movie" | "series";
  posterUrl?: string | null;
  backdropUrl?: string | null;
  releaseYear?: number | null;
  rating?: number | null;
  badgeText?: string;
  onClick?: () => void;
}

export function PosterCard({
  title,
  titleBn,
  slug,
  type,
  posterUrl,
  releaseYear,
  rating = 8.5,
  badgeText,
  onClick,
}: PosterCardProps) {
  const href = type === "series" ? `/series/${slug}` : `/movies/${slug}`;
  const displayTitle = titleBn || title;

  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative rounded-xl bg-surface-raised border border-border overflow-hidden cursor-pointer hover:border-red-600/60 hover:shadow-2xl hover:shadow-red-600/20 transition-all duration-300 transform hover:-translate-y-1 block"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-surface-base relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterUrl || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

        {badgeText && (
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white shadow-md">
              {badgeText}
            </span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="h-11 w-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-950/50 transform group-hover:scale-110 transition-transform">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-3 space-y-1 z-10">
        <div className="flex items-center justify-between text-[10px] text-text-muted font-medium">
          <span>{releaseYear || 2024}</span>
          {rating && (
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-current" /> {rating}
            </span>
          )}
        </div>
        <h3 className="text-xs font-bold text-text-primary group-hover:text-red-400 transition truncate">
          {displayTitle}
        </h3>
      </div>
    </Link>
  );
}
