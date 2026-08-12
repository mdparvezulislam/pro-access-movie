"use client";

import React, { useState, useEffect, useRef } from "react";
import { AdCreative } from "@/lib/ads/ad-engine";
import { AdRenderer } from "./AdRenderer";

interface AdSlotProps {
  placementKey: string;
  className?: string;
}

export function AdSlot({ placementKey, className = "" }: AdSlotProps) {
  const [creative, setCreative] = useState<AdCreative | null>(null);
  const [loading, setLoading] = useState(true);
  const trackedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAd() {
      try {
        const res = await fetch(`/api/ads/track?placement=${encodeURIComponent(placementKey)}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.creative) {
            setCreative(json.creative);

            // Record Impression once
            if (!trackedRef.current) {
              trackedRef.current = true;
              fetch("/api/ads/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  placementKey,
                  eventType: "adImpression",
                  adId: json.creative.id,
                }),
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.warn(`[AdSlot] Error loading ad for '${placementKey}':`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAd();
    return () => {
      isMounted = false;
    };
  }, [placementKey]);

  const handleAdClick = () => {
    if (!creative) return;
    fetch("/api/ads/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placementKey,
        eventType: "adClicked",
        adId: creative.id,
      }),
    }).catch(() => {});
  };

  if (loading) {
    return <div className={`min-h-[100px] w-full rounded-2xl bg-surface-base/50 animate-pulse ${className}`} />;
  }

  if (!creative) {
    return null; // Render nothing to prevent CLS or blank boxes
  }

  return (
    <div className={`w-full my-4 ${className}`}>
      <AdRenderer creative={creative} placementKey={placementKey} onAdClick={handleAdClick} />
    </div>
  );
}
