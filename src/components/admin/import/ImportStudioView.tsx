"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Film,
  Tv,
  Star,
  Loader2,
  Sparkles,
  AlertCircle,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ProviderSearchResult,
  ProviderType,
  ContentType,
  NormalizedMovieData,
  NormalizedSeriesData,
  DuplicateCheckResult,
} from "@/types/import";
import { MetadataPreviewModal } from "./MetadataPreviewModal";
import { toast } from "sonner";

export function ImportStudioView() {
  const [query, setQuery] = useState("Hawa");
  const [contentType, setContentType] = useState<ContentType | "all">("all");
  const [providerId, setProviderId] = useState<ProviderType>("tmdb");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ProviderSearchResult[]>([]);

  // Preview Modal State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ProviderSearchResult | null>(null);
  const [previewDetails, setPreviewDetails] = useState<NormalizedMovieData | NormalizedSeriesData | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResult | null>(null);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      const res = await fetch(
        `/api/admin/import/search?q=${encodeURIComponent(searchQuery.trim())}&type=${contentType}&provider=${providerId}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch search results.");
      }

      setResults(data.results || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to search provider.";
      toast.error(msg);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Initial search on mount
  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/admin/import/search?q=Hawa&type=all&provider=tmdb`
        );
        const data = await res.json();
        if (isMounted && res.ok) {
          setResults(data.results || []);
        }
      } catch {
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };
    fetchInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenPreview = async (item: ProviderSearchResult) => {
    setActiveItem(item);
    setPreviewDetails(null);
    setDuplicateCheck(null);
    setPreviewOpen(true);

    try {
      const res = await fetch("/api/admin/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: item.provider,
          external_id: item.external_id,
          type: item.type,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load preview details.");
      }

      setPreviewDetails(data.details);
      setDuplicateCheck(data.duplicateCheck);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch item details.";
      toast.error(msg);
      setPreviewOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-surface-base to-surface-base border border-red-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wide">
              Phase 04
            </span>
            <span className="text-xs text-text-muted">PRO ACCESS Import Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Metadata Import Studio
          </h1>
          <p className="text-xs text-text-secondary max-w-xl">
            Search external metadata providers, preview normalized information, detect duplicate catalog entries, and import movies & series as Drafts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border text-xs">
            <Database className="h-4 w-4 text-red-500" />
            <span className="font-semibold text-text-primary">Phase 03 Media Linked</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Provider Selector */}
      <div className="p-4 rounded-xl bg-surface-base border border-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              type="search"
              placeholder="Search movie or series title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-10 text-sm bg-surface-raised border-border focus:border-red-500/50"
            />
          </div>

          {/* Provider Select */}
          <div className="sm:col-span-3">
            <select
              value={providerId}
              onChange={(e) => {
                setProviderId(e.target.value as ProviderType);
              }}
              className="w-full h-10 px-3 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary focus:outline-none focus:border-red-500/50"
            >
              <option value="tmdb">TMDB API (The Movie Database)</option>
              <option value="demo">Demo Catalog (Offline / Bengali)</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-3">
            <Button
              onClick={() => handleSearch()}
              disabled={isSearching}
              variant="cinematic"
              className="w-full h-10 text-xs gap-2"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>Search Catalog</span>
            </Button>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setContentType("all"); handleSearch(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                contentType === "all"
                  ? "bg-red-600 text-white font-bold"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => { setContentType("movie"); handleSearch(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                contentType === "movie"
                  ? "bg-red-600 text-white font-bold"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              Movies
            </button>
            <button
              onClick={() => { setContentType("series"); handleSearch(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                contentType === "series"
                  ? "bg-red-600 text-white font-bold"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              <Tv className="h-3.5 w-3.5" />
              TV Series
            </button>
          </div>

          <div className="text-xs text-text-muted font-mono">
            {results.length} Results Found
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {isSearching ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl bg-surface-base border border-border animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 rounded-xl bg-surface-base border border-border text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-text-primary">No Metadata Results</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Try searching for a different title or switch to the Demo Catalog provider.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((item) => {
            const posterUrl = item.poster_url || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600";
            return (
              <div
                key={item.external_id}
                className="group relative rounded-xl bg-surface-base border border-border overflow-hidden flex flex-col justify-between hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-950/20"
              >
                {/* Poster Thumbnail */}
                <div className="relative aspect-[2/3] w-full bg-surface-raised overflow-hidden">
                  <Image
                    src={posterUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />

                  {/* Badge Overlay */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10 uppercase">
                      {item.type}
                    </span>
                  </div>

                  {item.vote_average && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black flex items-center gap-1">
                      <Star className="h-3 w-3 fill-black text-black" />
                      {item.vote_average}
                    </div>
                  )}
                </div>

                {/* Info & Action */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-red-400 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted">
                      {item.release_year && <span>{item.release_year}</span>}
                      {item.title_bn && <span className="text-red-400/80 font-bangla">({item.title_bn})</span>}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOpenPreview(item)}
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-[11px] font-bold gap-1 border-border group-hover:border-red-500/50 group-hover:bg-red-600 group-hover:text-white transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Preview & Import</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Metadata Preview Modal */}
      <MetadataPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        type={activeItem?.type || "movie"}
        details={previewDetails}
        duplicateCheck={duplicateCheck}
        providerId={activeItem?.provider || "tmdb"}
        externalId={activeItem?.external_id || ""}
      />
    </div>
  );
}
