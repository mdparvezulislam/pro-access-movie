"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Film,
  Download,
  Edit,
  Search,
  Star,
  Eye,
  Trash2,
  AlertTriangle,
  Plus,
  X,
  Loader2,
  CheckCircle2,
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
  const router = useRouter();
  const [moviesList, setMoviesList] = useState<MovieRecord[]>(initialMovies);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // New Movie Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTitleBn, setNewTitleBn] = useState("");
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [isCreating, setIsCreating] = useState(false);

  // Duplicate title counts
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

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a movie title.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "movie",
          title: newTitle.trim(),
          title_bn: newTitleBn.trim() || null,
          release_year: newYear,
          status: "draft",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create movie.");

      toast.success(`Created draft movie "${data.data.title}"!`);
      setShowCreateModal(false);
      setNewTitle("");
      setNewTitleBn("");
      router.push(`/admin/movies/${data.data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating movie.";
      toast.error(msg);
    } finally {
      setIsCreating(false);
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
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="cinematic"
            size="sm"
            className="h-9 text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Movie</span>
          </Button>

          <Link href="/admin/import">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 border-border">
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

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["all", "published", "draft", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
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

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block rounded-xl bg-surface-base border border-border overflow-hidden shadow-lg">
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
                                  <AlertTriangle className="h-3 w-3" /> Duplicate
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

      {/* MOBILE CARD LIST VIEW */}
      <div className="md:hidden space-y-3">
        {filteredMovies.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted rounded-xl bg-surface-base border border-border">
            No movies found.
          </div>
        ) : (
          filteredMovies.map((m) => {
            const posterUrl =
              (typeof m.media?.posterUrl === "string" && m.media.posterUrl) ||
              (typeof m.media?.posterPath === "string" && m.media.posterPath) ||
              "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400";

            return (
              <div key={m.id} className="p-4 rounded-xl bg-surface-base border border-border space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-10 rounded overflow-hidden bg-surface-raised shrink-0 border border-border">
                      <Image src={posterUrl} alt={m.title} fill className="object-cover" unoptimized />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-sm">{m.title}</h4>
                      {m.title_bn && <p className="text-xs text-red-400 font-bangla">{m.title_bn}</p>}
                      <p className="text-[10px] text-text-muted font-mono">{m.release_year} • {m.slug}</p>
                    </div>
                  </div>

                  <select
                    value={m.status}
                    onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                    className="px-2 py-1 rounded bg-surface-raised border border-border text-[11px] font-bold text-text-primary"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400" /> {m.rating || "N/A"}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/movies/${m.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </Link>
                    <Button onClick={() => handleDelete(m.id, m.title)} variant="ghost" size="icon" className="h-8 w-8 text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE NEW MOVIE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-base border border-border rounded-2xl p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Film className="h-5 w-5 text-red-500" /> Add New Movie Entry
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMovie} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Movie Title (English) *</label>
                <Input
                  required
                  placeholder="e.g., Karagar 2, Project K"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-surface-raised border-border text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Bengali Title (বাংলা)</label>
                <Input
                  placeholder="e.g., কারাগার ২"
                  value={newTitleBn}
                  onChange={(e) => setNewTitleBn(e.target.value)}
                  className="bg-surface-raised border-border text-xs font-bangla"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Release Year</label>
                <Input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                  className="bg-surface-raised border-border text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  variant="cinematic"
                  size="sm"
                  className="text-xs gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Create Draft & Edit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
