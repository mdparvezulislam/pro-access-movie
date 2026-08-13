"use client";

import React, { useState } from "react";
import { Film, Tv, PlaySquare, Server } from "lucide-react";
import { MediaSourceStudio } from "@/components/admin/sources/MediaSourceStudio";
import { ContentSourceType } from "@/types/sources";

interface ContentOption {
  id: string;
  title: string;
  title_bn?: string | null;
  slug: string;
  type: "movie" | "series";
}

interface PlaybackSourcesPageClientProps {
  movies: ContentOption[];
  series: ContentOption[];
}

export function PlaybackSourcesPageClient({
  movies,
  series,
}: PlaybackSourcesPageClientProps) {
  const [contentType, setContentType] = useState<ContentSourceType>("movie");
  const [selectedContentId, setSelectedContentId] = useState<string>(
    movies[0]?.id || ""
  );

  const selectedItem =
    contentType === "movie"
      ? movies.find((m) => m.id === selectedContentId)
      : series.find((s) => s.id === selectedContentId);

  return (
    <div className="space-y-6">
      {/* Content Selector Card */}
      <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Server className="h-4 w-4 text-red-500" /> Select Content for Media Sources Management
            </h3>
            <p className="text-xs text-text-muted">
              Choose a movie or web series to configure CDN video streaming servers and download mirrors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setContentType("movie");
                if (movies.length > 0) setSelectedContentId(movies[0].id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                contentType === "movie"
                  ? "bg-red-600/20 text-red-400 border-red-500/40"
                  : "bg-surface-raised text-text-muted border-border hover:text-text-primary"
              }`}
            >
              <Film className="h-3.5 w-3.5" /> Movies ({movies.length})
            </button>
            <button
              onClick={() => {
                setContentType("series");
                if (series.length > 0) setSelectedContentId(series[0].id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                contentType === "series"
                  ? "bg-red-600/20 text-red-400 border-red-500/40"
                  : "bg-surface-raised text-text-muted border-border hover:text-text-primary"
              }`}
            >
              <Tv className="h-3.5 w-3.5" /> TV Series ({series.length})
            </button>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1.5">
              Select {contentType === "movie" ? "Movie" : "Series"}
            </label>
            <select
              value={selectedContentId}
              onChange={(e) => setSelectedContentId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl text-xs font-bold bg-surface-raised border border-border text-text-primary focus:outline-none focus:border-red-500"
            >
              {contentType === "movie"
                ? movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} {m.title_bn ? `(${m.title_bn})` : ""}
                    </option>
                  ))
                : series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} {s.title_bn ? `(${s.title_bn})` : ""}
                    </option>
                  ))}
            </select>
          </div>

          {selectedItem && (
            <div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-[10px] text-red-400 uppercase font-bold">Selected Item</span>
                <h4 className="font-extrabold text-text-primary">{selectedItem.title}</h4>
                <p className="text-[11px] text-text-muted font-mono">ID: {selectedItem.id}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Studio V2 */}
      {selectedContentId ? (
        <MediaSourceStudio contentType={contentType} contentId={selectedContentId} />
      ) : (
        <div className="p-8 text-center rounded-2xl bg-surface-base border border-border text-xs text-text-muted">
          No content available. Please create a movie or series record first.
        </div>
      )}
    </div>
  );
}
