"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PublicContentItem } from "@/lib/content/public-catalog";
import { ContentCard } from "@/components/content/ContentCard";

interface ContentRailProps {
  title: string;
  subtitle?: string;
  items: PublicContentItem[];
  icon?: React.ReactNode;
}

export function ContentRail({ title, subtitle, items, icon }: ContentRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) {
    return null; // Intelligently hide empty rail
  }

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 my-8 group/rail">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
            {icon} {title}
          </h2>
          {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
        </div>

        {/* Desktop Left/Right Controls */}
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => handleScroll("left")}
            className="p-2 rounded-xl bg-surface-base border border-border text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="p-2 rounded-xl bg-surface-base border border-border text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Rail Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {items.map((item) => (
          <div key={item.id} className="w-[160px] sm:w-[200px] shrink-0">
            <ContentCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
