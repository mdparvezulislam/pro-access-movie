"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink, Play, Lock, AlertCircle } from "lucide-react";
import { AdCreative } from "@/lib/ads/ad-engine";
import { SmartAdGateConfig, DEFAULT_AD_GATE_CONFIG } from "@/lib/ads/ad-gate";

interface SmartAdGateModalProps {
  creative: AdCreative | null;
  config?: SmartAdGateConfig;
  onUnlock: () => void;
}

export function SmartAdGateModal({
  creative,
  config = DEFAULT_AD_GATE_CONFIG,
  onUnlock,
}: SmartAdGateModalProps) {
  const isMissingAd = !creative;
  const [timeLeft, setTimeLeft] = useState(isMissingAd ? 0 : config.adDurationSeconds);
  const [canSkip, setCanSkip] = useState(isMissingAd);
  const [hasError] = useState(isMissingAd);

  useEffect(() => {
    if (isMissingAd) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (config.adDurationSeconds - next >= config.skipDelaySeconds) {
          setCanSkip(true);
        }
        if (next <= 0) {
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMissingAd, config.adDurationSeconds, config.skipDelaySeconds]);

  const handleAdClick = () => {
    if (creative?.destinationUrl) {
      window.open(creative.destinationUrl, "_blank");
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md text-white select-none animate-fade-in">
      <div className="relative w-full max-w-xl bg-surface-base border border-border rounded-3xl p-6 shadow-2xl space-y-5 text-center">
        {/* Top Header Label */}
        <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-bold text-text-muted">
          <span className="flex items-center gap-1.5 text-amber-400 uppercase tracking-wider">
            <Lock className="h-4 w-4" /> Smart Ad Gate
          </span>
          <span className="font-mono text-text-secondary">
            {timeLeft > 0 ? `Ad ends in ${timeLeft}s` : "Unlocked!"}
          </span>
        </div>

        {/* Ad Content View */}
        {creative && !hasError ? (
          <div className="space-y-4">
            <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden bg-surface-raised border border-border group cursor-pointer" onClick={handleAdClick}>
              <Image src={creative.mediaUrl} alt={creative.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-4 flex flex-col justify-between">
                <span className="self-start px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Sponsored Ad
                </span>
                <div className="text-left space-y-1">
                  <h4 className="text-base font-extrabold text-white line-clamp-1">{creative.title}</h4>
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    Click to learn more <ExternalLink className="h-3 w-3" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface-raised border border-border space-y-2">
            <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-text-primary">Ad Preview Mode / Fallback</h4>
            <p className="text-xs text-text-muted">Stream playback will unlock automatically.</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          {canSkip && (
            <button
              onClick={onUnlock}
              className="px-4 py-2 rounded-xl bg-surface-raised hover:bg-surface-base border border-border text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
            >
              Skip Ad
            </button>
          )}

          <button
            onClick={onUnlock}
            disabled={timeLeft > 0 && !canSkip}
            className={`ml-auto px-6 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 transition-all ${
              timeLeft === 0 || canSkip
                ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                : "bg-surface-raised text-text-muted cursor-not-allowed opacity-60"
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{timeLeft === 0 ? "Continue Watching" : `Unlock in ${timeLeft}s`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
