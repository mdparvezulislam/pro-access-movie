"use client";

import React from "react";
import { Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface ContentFilterBarProps {
  selectedGenre?: string;
  selectedSort?: string;
  selectedYear?: string;
  onGenreChange: (genre: string) => void;
  onSortChange: (sort: string) => void;
  onYearChange: (year: string) => void;
}

const GENRES_LIST = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

const YEARS_LIST = ["All", "2026", "2025", "2024", "2023", "2022", "2021", "2020"];

export function ContentFilterBar({
  selectedGenre = "All",
  selectedSort = "latest",
  selectedYear = "All",
  onGenreChange,
  onSortChange,
  onYearChange,
}: ContentFilterBarProps) {
  return (
    <div className="p-4 rounded-xl bg-surface-base border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Genre Chips Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-1">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Filter className="h-3.5 w-3.5" /> Genre:
        </span>
        {GENRES_LIST.map((g) => {
          const isActive = (selectedGenre === "All" && g === "All") || selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => onGenreChange(g === "All" ? "" : g)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-surface-raised text-text-secondary hover:text-text-primary hover:bg-surface-raised/80 border border-border"
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Select Controls for Sort and Year */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 bg-surface-raised px-3 py-1.5 rounded-lg border border-border">
          <ArrowUpDown className="h-3.5 w-3.5 text-text-muted" />
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-text-primary focus:outline-none cursor-pointer"
          >
            <option value="latest" className="bg-surface-base">Latest Added</option>
            <option value="popular" className="bg-surface-base">Most Popular</option>
            <option value="top_rated" className="bg-surface-base">Top Rated</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-surface-raised px-3 py-1.5 rounded-lg border border-border">
          <SlidersHorizontal className="h-3.5 w-3.5 text-text-muted" />
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-text-primary focus:outline-none cursor-pointer"
          >
            {YEARS_LIST.map((y) => (
              <option key={y} value={y} className="bg-surface-base">
                {y === "All" ? "Year: All" : y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
