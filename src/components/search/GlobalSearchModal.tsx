"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Film, Tv, Star, Loader2, ArrowRight } from "lucide-react";
import { PublicContentItem } from "@/lib/content/public-catalog";

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ open, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ movies: PublicContentItem[]; series: PublicContentItem[] }>({
    movies: [],
    series: [],
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/import/search?q=${encodeURIComponent(query)}&type=all&provider=tmdb`);
        if (res.ok) {
          const json = await res.json();
          const movies: PublicContentItem[] = [];
          const series: PublicContentItem[] = [];

          (json.results || []).slice(0, 8).forEach((itemRaw: unknown) => {
            const r = itemRaw as Record<string, unknown>;
            const titleStr = String(r.title || "");
            const item: PublicContentItem = {
              id: String(r.external_id || r.id),
              type: r.type === "series" ? "series" : "movie",
              title: titleStr,
              title_bn: r.title_bn ? String(r.title_bn) : null,
              original_title: r.original_title ? String(r.original_title) : null,
              slug: String(r.slug || titleStr.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
              overview: r.overview ? String(r.overview) : null,
              release_year: r.release_year ? Number(r.release_year) : null,
              rating: r.vote_average ? Number(r.vote_average) : 7.5,
              poster_url: String(r.poster_url || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600"),
              backdrop_url: String(r.backdrop_url || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200"),
              status: "published",
              genres: Array.isArray(r.genres) ? (r.genres as string[]) : [],
              created_at: new Date().toISOString(),
            };
            if (r.type === "movie") movies.push(item);
            else series.push(item);
          });

          setResults({ movies, series });
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-surface-base border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col mt-12 sm:mt-20">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface-raised/50">
          <Search className="h-5 w-5 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV series, genres, cast..."
            className="w-full bg-transparent text-base font-medium text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-red-500 shrink-0" />
          ) : query ? (
            <button onClick={() => setQuery("")} className="p-1 rounded text-text-muted hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {!query.trim() && (
            <div className="py-12 text-center text-text-muted space-y-2">
              <Search className="h-10 w-10 mx-auto opacity-30" />
              <p className="text-sm font-medium">Type a movie or series title to begin searching...</p>
            </div>
          )}

          {query.trim() && results.movies.length === 0 && results.series.length === 0 && !loading && (
            <div className="py-12 text-center text-text-muted space-y-2">
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;.</p>
            </div>
          )}

          {/* Movies Results */}
          {results.movies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-red-400" /> Movies ({results.movies.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.movies.map((m) => (
                  <Link
                    key={m.id}
                    href={`/movies/${m.slug}`}
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-surface-raised border border-border flex items-center gap-3 hover:border-red-500/50 hover:bg-surface-raised/80 transition-all group"
                  >
                    <div className="relative h-16 w-11 rounded-lg overflow-hidden shrink-0 bg-surface-base border border-border">
                      <Image src={m.poster_url} alt={m.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-text-primary group-hover:text-red-400 truncate">
                        {m.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1 font-mono">
                        <span>{m.release_year}</span>
                        {m.rating && (
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {m.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-red-400 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Series Results */}
          {results.series.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Tv className="h-3.5 w-3.5 text-purple-400" /> TV Series ({results.series.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.series.map((s) => (
                  <Link
                    key={s.id}
                    href={`/series/${s.slug}`}
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-surface-raised border border-border flex items-center gap-3 hover:border-purple-500/50 hover:bg-surface-raised/80 transition-all group"
                  >
                    <div className="relative h-16 w-11 rounded-lg overflow-hidden shrink-0 bg-surface-base border border-border">
                      <Image src={s.poster_url} alt={s.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-text-primary group-hover:text-purple-400 truncate">
                        {s.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1 font-mono">
                        <span>{s.release_year}</span>
                        {s.rating && (
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {s.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-purple-400 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
