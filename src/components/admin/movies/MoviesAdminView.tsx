"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Film,
  Download,
  Edit,
  Search,
  Star,
  Eye,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  const [moviesList, setMoviesList] = useState<MovieRecord[]>(initialMovies);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Duplicate detector map
  const titleCounts: Record<string, number> = {};
  moviesList.forEach((m) => {
    const key = m.title.toLowerCase().trim();
    titleCounts[key] = (titleCounts[key] || 0) + 1;
  });

  const filteredMovies = moviesList.filter((m) => {
    const matchesSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.title_bn?.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredMovies.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/content/movie/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Updated status to ${newStatus}`);
        setMoviesList(moviesList.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
      } else {
        toast.error("Failed to update status.");
      }
    } catch {
      toast.error("Error updating status.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/content/movie/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Deleted ${title}`);
        setMoviesList(moviesList.filter((m) => m.id !== id));
        setSelectedIds(selectedIds.filter((item) => item !== id));
      } else {
        toast.error("Failed to delete movie.");
      }
    } catch {
      toast.error("Error deleting movie.");
    }
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    setIsUpdating(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/content/movie/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      toast.success(`Bulk updated ${selectedIds.length} movies to ${newStatus}`);
      setMoviesList(moviesList.map((m) => (selectedIds.includes(m.id) ? { ...m, status: newStatus } : m)));
      setSelectedIds([]);
    } catch {
      toast.error("Bulk update failed.");
    } finally {
      setIsUpdating(false);
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

      {/* Filter & Bulk Bar */}
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

      {/* Selected Items Action Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
          <span className="font-bold text-purple-300">{selectedIds.length} movie(s) selected</span>
          <div className="flex items-center gap-2">
            <Button onClick={() => handleBulkStatus("published")} disabled={isUpdating} size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30 text-emerald-400">
              Bulk Publish
            </Button>
            <Button onClick={() => handleBulkStatus("draft")} disabled={isUpdating} size="sm" variant="outline" className="h-7 text-xs border-amber-500/30 text-amber-400">
              Bulk Draft
            </Button>
            <Button onClick={() => handleBulkStatus("archived")} disabled={isUpdating} size="sm" variant="outline" className="h-7 text-xs border-zinc-500/30 text-zinc-400">
              Bulk Archive
            </Button>
          </div>
        </div>
      )}

      {/* Catalog Table */}
      <div className="rounded-xl bg-surface-base border border-border overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-raised/60 text-text-muted font-bold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredMovies.length && filteredMovies.length > 0} className="rounded accent-red-600 cursor-pointer" />
                </th>
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
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    No movies found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMovies.map((m) => {
                  const posterUrl =
                    (typeof m.media?.posterUrl === "string" && m.media.posterUrl) ||
                    (typeof m.media?.posterPath === "string" && m.media.posterPath) ||
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400";

                  const isDuplicate = (titleCounts[m.title.toLowerCase().trim()] || 0) > 1;

                  return (
                    <tr key={m.id} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="p-3.5 text-center">
                        <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => handleToggleSelect(m.id)} className="rounded accent-red-600 cursor-pointer" />
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-8 rounded overflow-hidden bg-surface-raised shrink-0 border border-border">
                            <Image src={posterUrl} alt={m.title} fill className="object-cover" unoptimized />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-text-primary text-sm">
                                {m.title} {m.title_bn && <span className="text-red-400 font-normal">({m.title_bn})</span>}
                              </p>
                              {isDuplicate && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" /> Duplicate Title
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-muted font-mono">{m.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-text-secondary">{m.release_year || "N/A"}</td>
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
                      <td className="p-3.5">
                        <select
                          value={m.status}
                          onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                          className="px-2 py-1 rounded bg-surface-raised border border-border text-xs font-bold text-text-primary"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
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
                          <Button onClick={() => handleDelete(m.id, m.title)} variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
