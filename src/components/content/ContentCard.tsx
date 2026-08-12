"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Film, Tv, Play } from "lucide-react";
import { PublicContentItem } from "@/lib/content/public-catalog";

interface ContentCardProps {
  item: PublicContentItem;
  priority?: boolean;
}

export function ContentCard({ item, priority = false }: ContentCardProps) {
  const isMovie = item.type === "movie";
  const href = isMovie ? `/movies/${item.slug}` : `/series/${item.slug}`;

  return (
    <div className="group relative flex flex-col rounded-xl bg-surface-base border border-border overflow-hidden shadow-lg transition-all duration-300 hover:border-red-500/50 hover:shadow-red-950/20 hover:-translate-y-1">
      {/* Poster Image Container */}
      <Link href={href} className="relative aspect-[2/3] w-full overflow-hidden bg-surface-raised">
        <Image
          src={item.poster_url}
          alt={item.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-6 w-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-text-primary border border-white/10 flex items-center gap-1">
            {isMovie ? <Film className="h-3 w-3 text-red-400" /> : <Tv className="h-3 w-3 text-purple-400" />}
            {item.type}
          </span>

          {item.rating && (
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/90 text-black flex items-center gap-0.5 shadow-md">
              <Star className="h-3 w-3 fill-black text-black" />
              {item.rating.toFixed(1)}
            </span>
          )}
        </div>
      </Link>

      {/* Content Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <Link href={href}>
            <h3 className="text-sm font-bold text-text-primary group-hover:text-red-400 transition-colors line-clamp-1">
              {item.title}
            </h3>
          </Link>
          {item.title_bn && (
            <p className="text-[11px] text-text-muted line-clamp-1">
              {item.title_bn}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-text-muted font-medium pt-1 border-t border-border/40">
          <span>{item.release_year || "2026"}</span>
          {item.duration_minutes && <span>{item.duration_minutes} min</span>}
        </div>
      </div>
    </div>
  );
}
