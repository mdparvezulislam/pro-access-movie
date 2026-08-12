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
    <div className="relative w-full max-w-7xl mx-auto my-6 rounded-2xl overflow-hidden bg-card border border-border shadow-xl group">
      <div className="relative h-32 sm:h-40 w-full flex items-center justify-between px-6 sm:px-10 overflow-hidden">
        {/* Background Artwork */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

        {/* Content Details */}
        <div className="relative z-10 space-y-1.5 max-w-lg">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Sponsored Ad
          </span>
          <h4 className="font-extrabold text-base sm:text-lg text-text-primary leading-tight">
            {title}
          </h4>
        </div>

        {/* CTA Button */}
        <div className="relative z-10 shrink-0">
          <a
            href={destinationUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onClick}
          >
            <Button variant="cinematic" size="sm" className="gap-2 text-xs shadow-lg shadow-red-950/40">
              <span>{ctaText}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
