import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Heart, Film, ArrowLeft } from "lucide-react";
import { getPublicMovies } from "@/lib/content/public-catalog";
import { ContentCard } from "@/components/content/ContentCard";
import { AdSlot } from "@/components/ads/AdSlot";

export const metadata: Metadata = {
  title: "My List — PRO ACCESS MOVIE",
  description: "View and manage your saved movies and TV series.",
};

export default async function MyListPage() {
  const { items } = await getPublicMovies();
  const savedItems = items.slice(0, 8); // Demo saved items

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" /> My Saved Watchlist ({savedItems.length})
          </h1>
        </div>
      </div>

      <AdSlot placementKey="my_list_banner" />

      {savedItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-surface-base border border-border space-y-3">
          <Film className="h-12 w-12 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-text-primary">Your Watchlist is Empty</h3>
          <p className="text-xs text-text-muted">Save your favorite movies and TV series to quickly stream them anytime.</p>
          <Link href="/movies" className="inline-block px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {savedItems.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
