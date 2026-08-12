"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Film,
  Download,
  Edit,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Star,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MovieRecord {
  id: string;
  title: string;
  title_bn?: string | null;
  slug: string;
  status: string;
  release_year?: number | null;
  duration_minutes?: number | null;
  rating?: number | null;
  media?: Record<string, unknown> | null;
}

interface MoviesAdminViewProps {
  movies: MovieRecord[];
}

export function MoviesAdminView({ movies: initialMovies }: MoviesAdminViewProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredMovies = initialMovies.filter((m) => {
    const matchesSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.title_bn?.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
            <CheckCircle2 className="h-3 w-3" /> Published
          </span>
        );
      case "draft":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" /> Draft
          </span>
        );
      case "archived":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 flex items-center gap-1 w-fit">
            <Archive className="h-3 w-3" /> Archived
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-raised text-text-muted border border-border capitalize w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-base border border-border shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-red-500" />
            <h1 className="text-xl font-extrabold text-text-primary">Movies Catalog Management</h1>
          </div>
          <p className="text-xs text-text-muted">
            Manage movie entries, localized metadata, posters, backdrops, and publishing status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/import">
            <Button variant="cinematic" size="sm" className="h-9 text-xs gap-1.5">
              <Download className="h-4 w-4" />
              <span>Import via Metadata Engine</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-surface-base border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search movie title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-surface-raised border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "published", "draft", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterStatus === st
                  ? "bg-red-600 text-white font-bold"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-xl bg-surface-base border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-raised/60 text-text-muted font-bold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Movie Info</th>
                <th className="p-3.5">Release Year</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredMovies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    No movies found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMovies.map((m) => {
                  const posterUrl =
                    (typeof m.media?.posterUrl === "string" && m.media.posterUrl) ||
                    (typeof m.media?.posterPath === "string" && m.media.posterPath) ||
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400";

                  return (
                    <tr key={m.id} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-8 rounded overflow-hidden bg-surface-raised shrink-0 border border-border">
                            <Image src={posterUrl} alt={m.title} fill className="object-cover" unoptimized />
                          </div>
                          <div>
                            <p className="font-bold text-text-primary text-sm">
                              {m.title} {m.title_bn && <span className="text-red-400 font-normal">({m.title_bn})</span>}
                            </p>
                            <p className="text-[11px] text-text-muted font-mono">{m.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-text-secondary">
                        {m.release_year || "N/A"}
                      </td>
                      <td className="p-3.5 font-bold text-amber-400">
                        {m.rating ? (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {m.rating}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3.5">{getStatusBadge(m.status)}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/movies/${m.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-primary" title="View Public Page">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/movies/${m.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-border">
                              <Edit className="h-3.5 w-3.5" /> Edit
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
    </div>
  );
}
