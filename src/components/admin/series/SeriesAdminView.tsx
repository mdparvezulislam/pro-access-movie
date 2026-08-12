"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Search,
  CheckCircle2,
  Clock,
  Star,
  Eye,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SeriesRecord {
  id: string;
  title: string;
  title_bn?: string | null;
  slug: string;
  status: string;
  release_year?: number | null;
  rating?: number | null;
  media?: Record<string, unknown> | null;
}

interface SeriesAdminViewProps {
  seriesList: SeriesRecord[];
}

export function SeriesAdminView({ seriesList }: SeriesAdminViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredSeries = seriesList.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.title_bn && s.title_bn.includes(searchTerm)) ||
      s.slug.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface-base border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TV series..."
            className="pl-9 h-9 text-xs bg-surface-raised border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Drafts Only</option>
            <option value="published">Published Only</option>
          </select>

          <Link href="/admin/import">
            <Button size="sm" variant="cinematic" className="h-9 text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
              <Download className="h-3.5 w-3.5" /> Import Series
            </Button>
          </Link>
        </div>
      </div>

      {/* Series Table */}
      <div className="rounded-xl border border-border bg-surface-base overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-raised font-bold uppercase tracking-wider text-text-muted border-b border-border">
            <tr>
              <th className="p-4">Series Title</th>
              <th className="p-4">Year</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSeries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  No TV Series found matching filters.
                </td>
              </tr>
            ) : (
              filteredSeries.map((s) => {
                const posterUrl =
                  (typeof s.media?.posterUrl === "string" && s.media.posterUrl) ||
                  (typeof s.media?.posterPath === "string" && s.media.posterPath) ||
                  "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400";

                return (
                  <tr key={s.id} className="hover:bg-surface-raised/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-8 rounded overflow-hidden bg-surface-raised shrink-0 border border-border">
                          <Image
                            src={posterUrl}
                            alt={s.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-extrabold text-text-primary text-sm block">
                            {s.title}
                          </span>
                          {s.title_bn && (
                            <span className="text-xs text-text-muted font-bangla block">
                              {s.title_bn}
                            </span>
                          )}
                          <span className="text-[10px] text-text-muted font-mono">
                            /{s.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-semibold text-text-secondary">
                      {s.release_year || "N/A"}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{s.rating ? Number(s.rating).toFixed(1) : "N/A"}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      {s.status === "published" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Draft
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/series/${s.id}`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-purple-500/30 text-purple-300 hover:bg-purple-950/40">
                            <Layers className="h-3.5 w-3.5" /> Edit & Seasons
                          </Button>
                        </Link>

                        <Link href={`/series/${s.slug}`} target="_blank">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-text-muted hover:text-text-primary">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
