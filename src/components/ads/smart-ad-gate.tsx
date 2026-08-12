"use client";

import { useState, useEffect } from "react";
import { ExternalLink, SkipForward, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SmartAdGateProps {
  title: string;
  mediaUrl: string;
  destinationUrl: string;
  ctaText?: string;
  durationSeconds?: number;
  onComplete: () => void;
}

export function SmartAdGate({
  title,
  mediaUrl,
  destinationUrl,
  ctaText = "Visit Sponsor",
  durationSeconds = 8,
  onComplete,
}: SmartAdGateProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const canSkip = timeLeft <= 0;

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
      {/* Background artwork */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl}
        alt="Sponsor Ad"
        className="absolute inset-0 h-full w-full object-cover opacity-20 filter blur-sm"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      {/* Ad Details Modal Container */}
      <div className="relative z-10 max-w-md w-full p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
            <ShieldAlert className="h-4 w-4" />
            <span>Sponsor Advertisement</span>
          </div>
          <span className="text-xs text-text-muted">
            {timeLeft > 0 ? `Resume in ${timeLeft}s` : "Ad Finished"}
          </span>
        </div>

        <div className="aspect-video w-full rounded-xl overflow-hidden bg-surface-base relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl} alt={title} className="h-full w-full object-cover" />
        </div>

        <h3 className="font-extrabold text-base text-text-primary leading-snug">{title}</h3>

        <div className="flex items-center gap-3 pt-2">
          <a
            href={destinationUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button variant="cinematic" className="w-full text-xs gap-2">
              <span>{ctaText}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>

          <Button
            variant={canSkip ? "outline" : "ghost"}
            disabled={!canSkip}
            onClick={onComplete}
            className="gap-1.5 text-xs border-border"
          >
            <span>{canSkip ? "Skip Ad" : `${timeLeft}s`}</span>
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
