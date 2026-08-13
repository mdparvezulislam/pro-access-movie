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
      className="group relative flex items-center cursor-pointer select-none shrink-0 py-2"
    >
      {/* Big Ranking Number */}
      <span className="text-6xl sm:text-8xl md:text-9xl font-black italic tracking-tighter bg-gradient-to-b from-neutral-800 via-neutral-600 to-neutral-400 dark:from-white dark:via-neutral-400 dark:to-neutral-800 bg-clip-text text-transparent group-hover:from-red-600 group-hover:to-rose-600 transition-all duration-300 z-10 -mr-5 sm:-mr-8 md:-mr-10 select-none leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
        {rank}
      </span>

      {/* Poster Card */}
      <div className="relative w-[125px] sm:w-[155px] md:w-[180px] aspect-[2/3] rounded-xl sm:rounded-2xl bg-surface-raised border border-border/60 overflow-hidden shadow-2xl group-hover:border-red-600/60 transition-all duration-300 z-0 transform group-hover:-translate-y-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
          <p className="text-xs font-extrabold text-white truncate drop-shadow-sm">{displayTitle}</p>
        </div>
      </div>
    </Link>
  );
}
