import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Clock, Play, ArrowLeft } from "lucide-react";
import { getPublicMovies } from "@/lib/content/public-catalog";
import { ContentCard } from "@/components/content/ContentCard";
import { AdSlot } from "@/components/ads/AdSlot";

export const metadata: Metadata = {
  title: "Continue Watching — PRO ACCESS MOVIE",
  description: "Resume your recently watched movies and TV series episodes.",
};

export default async function ContinueWatchingPage() {
  const { items } = await getPublicMovies();
  const historyItems = items.slice(0, 6);

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-2">
            <Clock className="h-6 w-6 text-amber-400" /> Continue Watching ({historyItems.length})
          </h1>
        </div>
      </div>

      <AdSlot placementKey="continue_watching_banner" />

      {historyItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-surface-base border border-border space-y-3">
          <Clock className="h-12 w-12 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-text-primary">No Playback History</h3>
          <p className="text-xs text-text-muted">Start streaming a movie or series to track your progress here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyItems.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-2xl bg-surface-base border border-border space-y-3 shadow-lg flex flex-col justify-between">
              <ContentCard item={item} />
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-text-muted font-semibold">
                  <span>Progress: {35 + idx * 10}%</span>
                  <span>Resume</span>
                </div>
                <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${35 + idx * 10}%` }} />
                </div>
                <Link
                  href={`/watch/movie/${item.slug}`}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Resume Watching
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
