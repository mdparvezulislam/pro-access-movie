"use client";

import { useRef, ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ContentRailProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  seeAllHref?: string;
  children: ReactNode;
}

export function ContentRail({
  title,
  subtitle,
  icon,
  seeAllHref,
  children,
}: ContentRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollRef.current.scrollTo({
      left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative space-y-3 py-4 group/rail">
      {/* Rail Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {icon && <div className="text-red-500">{icon}</div>}
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h2>
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-xs font-semibold text-text-muted hover:text-red-400 transition cursor-pointer flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Scrollable Container with Arrows */}
      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/80 text-white border border-white/20 flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity cursor-pointer hover:bg-red-600 hidden md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scroll Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth px-1"
        >
          {children}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/80 text-white border border-white/20 flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity cursor-pointer hover:bg-red-600 hidden md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
