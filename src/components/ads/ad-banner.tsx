"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdBannerProps {
  title: string;
  mediaUrl: string;
  destinationUrl: string;
  ctaText?: string;
  onClick?: () => void;
}

export function AdBanner({ title, mediaUrl, destinationUrl, ctaText = "Learn More", onClick }: AdBannerProps) {
  return (
    <div className="relative w-full max-w-7xl mx-auto rounded-2xl overflow-hidden bg-surface-raised border border-border shadow-xl group transition-all">
      <div className="relative min-h-[96px] sm:min-h-[120px] w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 p-4 sm:px-8 sm:py-5 overflow-hidden">
        {/* Background Artwork */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-30 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-raised via-surface-raised/90 to-transparent" />

        {/* Content Details */}
        <div className="relative z-10 space-y-1 max-w-lg">
          <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Sponsored Ad
          </span>
          <h4 className="font-extrabold text-sm sm:text-base md:text-lg text-text-primary leading-tight">
            {title}
          </h4>
        </div>

        {/* CTA Button */}
        <div className="relative z-10 shrink-0 self-end sm:self-auto">
          <a
            href={destinationUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onClick}
          >
            <Button variant="cinematic" size="sm" className="gap-2 text-xs font-extrabold shadow-lg shadow-red-950/30 min-h-[44px] px-5 rounded-xl">
              <span>{ctaText}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
