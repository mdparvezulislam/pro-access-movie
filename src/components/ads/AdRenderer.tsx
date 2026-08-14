"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink, X, Film, PlayCircle, Sparkles } from "lucide-react";
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

  // 1. Native Card / Native Ad Type
  if (creative.type === "card" || creative.type === "native") {
    return (
      <div className="relative rounded-2xl bg-surface-base border border-border overflow-hidden p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl transition-all hover:border-purple-500/30">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 bg-surface-raised border border-border">
            {creative.mediaUrl ? (
              <Image src={creative.mediaUrl} alt={creative.title} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-purple-900/20 text-purple-400">
                <Sparkles className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Sponsored
            </span>
            <h4 className="text-sm font-bold text-text-primary line-clamp-1">{creative.title}</h4>
            {creative.description && (
              <p className="text-xs text-text-muted line-clamp-1">{creative.description}</p>
            )}
          </div>
        </div>

        <a
          href={creative.destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>{creative.ctaText || "Learn More"}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  // 2. Video Ad Type
  if (creative.type === "video") {
    return (
      <div className="relative rounded-2xl bg-black border border-border overflow-hidden p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-32 rounded-xl overflow-hidden shrink-0 bg-surface-raised border border-border flex items-center justify-center">
            {creative.mediaUrl ? (
              <Image src={creative.mediaUrl} alt={creative.title} fill className="object-cover opacity-80" />
            ) : null}
            <PlayCircle className="h-8 w-8 text-white relative z-10 drop-shadow-md" />
          </div>
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
              Video Sponsor
            </span>
            <h4 className="text-sm font-bold text-white line-clamp-1">{creative.title}</h4>
            {creative.description && (
              <p className="text-xs text-neutral-400 line-clamp-1">{creative.description}</p>
            )}
          </div>
        </div>

        <a
          href={creative.destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>{creative.ctaText || "Watch Sponsor"}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  // 3. Player Overlay Ad Type
  if (creative.type === "overlay") {
    return (
      <div className="relative rounded-xl bg-black/85 backdrop-blur-md border border-white/10 p-3 sm:p-4 flex items-center justify-between gap-3 text-white max-w-md shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-surface-raised border border-white/10">
            {creative.mediaUrl ? (
              <Image src={creative.mediaUrl} alt={creative.title} fill className="object-cover" />
            ) : (
              <Film className="h-5 w-5 text-purple-400 m-auto" />
            )}
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-purple-400">Ad</span>
            <h5 className="text-xs font-bold line-clamp-1">{creative.title}</h5>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={creative.destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-[11px] font-bold hover:bg-purple-700 transition-colors shrink-0"
          >
            {creative.ctaText || "Visit"}
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

  // 4. Interstitial Ad Type
  if (creative.type === "interstitial") {
    return (
      <div className="relative rounded-2xl bg-surface-base border border-purple-500/30 overflow-hidden p-6 text-center space-y-4 shadow-2xl max-w-lg mx-auto">
        <div className="relative h-40 w-full rounded-xl overflow-hidden bg-black border border-border">
          {creative.mediaUrl && (
            <Image src={creative.mediaUrl} alt={creative.title} fill className="object-cover" />
          )}
        </div>
        <div className="space-y-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Featured Interstitial
          </span>
          <h3 className="text-base font-extrabold text-text-primary">{creative.title}</h3>
          {creative.description && (
            <p className="text-xs text-text-muted">{creative.description}</p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href={creative.destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg transition-colors flex items-center gap-1.5"
          >
            <span>{creative.ctaText || "Claim Offer"}</span>
            <ExternalLink className="h-4 w-4" />
          </a>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-surface-raised border border-border text-xs font-bold text-text-muted hover:text-text-primary"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    );
  }

  // 5. Image / Banner Ad Type (Default)
  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-surface-raised via-surface-base to-surface-raised border border-border overflow-hidden p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-28 sm:h-20 sm:w-36 rounded-xl overflow-hidden shrink-0 bg-surface-base border border-border">
          {creative.mediaUrl ? (
            <Image src={creative.mediaUrl} alt={creative.title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-purple-900/20 text-purple-400">
              <Sparkles className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Advertisement
            </span>
            <span className="text-[11px] text-text-muted font-mono">{placementKey}</span>
          </div>
          <h3 className="text-base font-bold text-text-primary line-clamp-1">{creative.title}</h3>
          {creative.description && (
            <p className="text-xs text-text-muted line-clamp-1">{creative.description}</p>
          )}
        </div>
      </div>

      <a
        href={creative.destinationUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg transition-colors flex items-center gap-2 shrink-0"
      >
        <span>{creative.ctaText || "Learn More"}</span>
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
