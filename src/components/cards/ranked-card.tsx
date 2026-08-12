"use client";

import Link from "next/link";

export interface RankedCardProps {
  id: string;
  title: string;
  titleBn?: string | null;
  slug: string;
  type: "movie" | "series";
  posterUrl: string;
  rank: number;
  onClick?: () => void;
}

export function RankedCard({
  title,
  titleBn,
  slug,
  type,
  posterUrl,
  rank,
  onClick,
}: RankedCardProps) {
  const href = type === "series" ? `/series/${slug}` : `/movies/${slug}`;
  const displayTitle = titleBn || title;

  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative flex items-center cursor-pointer select-none shrink-0"
    >
      {/* Big Ranking Number */}
      <span className="text-7xl md:text-9xl font-black italic tracking-tighter text-neutral-800 dark:text-neutral-800/90 group-hover:text-red-600 transition-colors z-10 -mr-6 md:-mr-10 drop-shadow-xl select-none leading-none">
        {rank}
      </span>

      {/* Poster Card */}
      <div className="relative w-28 md:w-40 aspect-[2/3] rounded-xl bg-surface-raised border border-border overflow-hidden shadow-2xl group-hover:border-red-600/60 transition-all duration-300 z-0 transform group-hover:-translate-y-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <p className="text-[11px] font-bold text-white truncate">{displayTitle}</p>
        </div>
      </div>
    </Link>
  );
}
