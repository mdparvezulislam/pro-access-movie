"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink, X } from "lucide-react";
import { AdCreative } from "@/lib/ads/ad-engine";

interface AdRendererProps {
  creative: AdCreative;
  placementKey: string;
  onAdClick?: () => void;
  onClose?: () => void;
}

export function AdRenderer({ creative, placementKey, onAdClick, onClose }: AdRendererProps) {
  const handleClick = () => {
    onAdClick?.();
  };

  // 1. Native Card Ad Type
  if (creative.type === "card") {
    return (
      <div className="relative rounded-2xl bg-surface-base border border-border overflow-hidden p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 bg-surface-raised border border-border">
            <Image src={creative.mediaUrl} alt={creative.title} fill className="object-cover" />
          </div>
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Sponsored
            </span>
            <h4 className="text-sm font-bold text-text-primary line-clamp-1">{creative.title}</h4>
            <p className="text-xs text-text-muted">High Speed Fast Streaming Partner</p>
          </div>
        </div>

        <a
          href={creative.destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>{creative.ctaText}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  // 2. Player Overlay Ad Type
  if (creative.type === "overlay") {
    return (
      <div className="relative rounded-xl bg-black/80 backdrop-blur-md border border-white/10 p-3 sm:p-4 flex items-center justify-between gap-3 text-white max-w-md shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-surface-raised border border-white/10">
            <Image src={creative.mediaUrl} alt={creative.title} fill className="object-cover" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-amber-400">Ad</span>
            <h5 className="text-xs font-bold line-clamp-1">{creative.title}</h5>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={creative.destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 transition-colors shrink-0"
          >
            {creative.ctaText}
          </a>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded text-white/60 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Banner Ad Type (Default)
  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-surface-raised via-surface-base to-surface-raised border border-border overflow-hidden p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-28 sm:h-20 sm:w-36 rounded-xl overflow-hidden shrink-0 bg-surface-base border border-border">
          <Image src={creative.mediaUrl} alt={creative.title} fill className="object-cover" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Advertisement
            </span>
            <span className="text-[11px] text-text-muted font-mono">{placementKey}</span>
          </div>
          <h3 className="text-base font-bold text-text-primary line-clamp-1">{creative.title}</h3>
        </div>
      </div>

      <a
        href={creative.destinationUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="px-6 py-3 rounded-xl bg-red-600 text-white text-xs font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2 shrink-0"
      >
        <span>{creative.ctaText}</span>
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
