"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Loader2,
  Tv,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { toast } from "sonner";

interface SeriesOption {
  id: string;
  title: string;
}

interface SeasonItem {
  id: string;
  series_id: string;
  season_number: number;
  title: string | null;
  description: string | null;
  status: string;
  media?: { posterUrl?: string; posterPath?: string } | null;
  series?: { id: string; title: string } | null;
  created_at?: string;
}

export function SeasonsManager() {
  const [seasons, setSeasons] = useState<SeasonItem[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [formSeriesId, setFormSeriesId] = useState<string>("");
  const [formSeasonNumber, setFormSeasonNumber] = useState<number>(1);
  const [formTitle, setFormTitle] = useState<string>("Season 1");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formStatus, setFormStatus] = useState<string>("draft");
  const [formPosterPath, setFormPosterPath] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deletingSeason, setDeletingSeason] = useState<SeasonItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Series List
  const fetchSeries = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content?type=series");
      if (res.ok) {
        const data = await res.json();
        const list = (data.items || []).map((s: { id: string; title: string }) => ({
          id: s.id,
          title: s.title,
        }));
        setSeriesList(list);
        if (list.length > 0 && !formSeriesId) {
          setFormSeriesId(list[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch series list:", err);
    }
  }, [formSeriesId]);

  // Fetch Seasons List
  const fetchSeasons = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/seasons?series_id=${selectedSeriesId}&status=${selectedStatus}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSeasons(data.seasons || []);
      }
    } catch (err) {
      console.error("Failed to fetch seasons:", err);
      toast.error("Could not load seasons.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSeriesId, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchSeries();
  }, []);

  useEffect(() => {
    fetchSeasons();
  }, [selectedSeriesId, selectedStatus, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    if (seriesList.length > 0) {
      setFormSeriesId(seriesList[0].id);
    }
    setFormSeasonNumber(1);
    setFormTitle("Season 1");
    setFormDescription("");
    setFormStatus("draft");
    setFormPosterPath("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: SeasonItem) => {
    setEditingId(item.id);
    setFormSeriesId(item.series_id);
    setFormSeasonNumber(item.season_number);
    setFormTitle(item.title || `Season ${item.season_number}`);
    setFormDescription(item.description || "");
    setFormStatus(item.status || "draft");
    setFormPosterPath(item.media?.posterPath || item.media?.posterUrl || "");
    setIsModalOpen(true);
  };

  const handleSaveSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSeriesId) {
      toast.error("Please select a series.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        series_id: formSeriesId,
        season_number: Number(formSeasonNumber),
        title: formTitle.trim(),
        description: formDescription.trim(),
        status: formStatus,
        media: { posterUrl: formPosterPath, posterPath: formPosterPath },
      };

      const url = editingId ? `/api/admin/seasons/${editingId}` : "/api/admin/seasons";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save season.");
      }

      toast.success(editingId ? "Season updated!" : "Season created!");
      setIsModalOpen(false);
      fetchSeasons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save season.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeason = async () => {
    if (!deletingSeason) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/seasons/${deletingSeason.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not delete season.");
      }

      toast.success("Season deleted.");
      setDeletingSeason(null);
      fetchSeasons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete season.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-base border border-border shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Seasons Management
            </h1>
            <p className="text-xs text-text-muted">
              Organize TV series into seasons, sequence numbers, and release statuses.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="cinematic"
          className="h-10 text-xs gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Season</span>
        </Button>
      </div>

      {/* Toolbar Filters */}
      <div className="p-4 rounded-xl bg-surface-base border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search seasons by title or description..."
              className="pl-9 h-9 text-xs bg-surface-raised border-border"
            />
          </div>

          {/* Series Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted whitespace-nowrap">
              Series:
            </span>
            <select
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary"
            >
              <option value="all">All Series ({seriesList.length})</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted whitespace-nowrap">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading seasons from database...</p>
        </div>
      ) : seasons.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border space-y-3">
          <Layers className="h-10 w-10 text-text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">No Seasons Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {searchQuery || selectedSeriesId !== "all"
              ? "No seasons match your active search filters."
              : "No seasons have been created yet. Click 'Add Season' to get started."}
          </p>
          <Button
            onClick={handleOpenCreateModal}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-border"
          >
            Create Season
          </Button>
        </div>
      ) : (
        <>
          {/* DESKTOP DATA TABLE (md:block) */}
          <div className="hidden md:block rounded-2xl bg-surface-base border border-border shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised/60 text-text-muted font-bold border-b border-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Season</th>
                  <th className="py-3 px-4">Parent Series</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {seasons.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-raised/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-text-primary">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-xs font-bold border border-purple-500/20">
                          S{item.season_number}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-medium">
                      <div className="flex items-center gap-1.5">
                        <Tv className="h-3.5 w-3.5 text-text-muted" />
                        <span>{item.series?.title || "Unknown Series"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-text-primary">
                      {item.title || `Season ${item.season_number}`}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : item.status === "archived"
                            ? "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(item)}
                          className="h-8 w-8 text-text-muted hover:text-text-primary"
                          title="Edit Season"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingSeason(item)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          title="Delete Season"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW (md:hidden) */}
          <div className="md:hidden space-y-3">
            {seasons.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-surface-base border border-border shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-xs font-bold border border-purple-500/20">
                      S{item.season_number}
                    </span>
                    <h4 className="text-xs font-bold text-text-primary">
                      {item.title || `Season ${item.season_number}`}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-[11px] text-text-muted flex items-center gap-1">
                  <Tv className="h-3 w-3" />
                  <span>Series: {item.series?.title || "Unknown"}</span>
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditModal(item)}
                    className="h-8 text-xs gap-1 border-border"
                  >
                    <Edit className="h-3 w-3" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingSeason(item)}
                    className="h-8 text-xs gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CREATE / EDIT SEASON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface-base border border-purple-500/30 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-400" />
                {editingId ? "Edit Season" : "Create New Season"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSeason} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Parent Series *</label>
                <select
                  value={formSeriesId}
                  onChange={(e) => setFormSeriesId(e.target.value)}
                  required
                  disabled={Boolean(editingId)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-medium"
                >
                  {seriesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Season Number *</label>
                  <Input
                    type="number"
                    min={1}
                    value={formSeasonNumber}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormSeasonNumber(val);
                      if (!editingId || !formTitle) setFormTitle(`Season ${val}`);
                    }}
                    required
                    className="h-10 text-xs bg-surface-raised border-border font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Season Title</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Season 1 or Redemption Arc"
                  className="h-10 text-xs bg-surface-raised border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Overview Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Season summary or plot description..."
                  className="w-full p-3 rounded-xl bg-surface-raised border border-border text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Poster Image Asset</label>
                <MediaPicker
                  label="Season Poster"
                  value={formPosterPath}
                  onChange={(path) => setFormPosterPath(path)}
                  aspectRatio="poster"
                  folder="series"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="cinematic"
                  disabled={isSubmitting}
                  className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>{editingId ? "Update Season" : "Create Season"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSeason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-extrabold text-text-primary">
                Delete Season S{deletingSeason.season_number}?
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Are you sure you want to delete <strong className="text-text-primary">&quot;{deletingSeason.title || `Season ${deletingSeason.season_number}`}&quot;</strong>? Seasons containing active episodes cannot be deleted until episodes are removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingSeason(null)}
                disabled={isDeleting}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSeason}
                disabled={isDeleting}
                className="h-9 text-xs gap-1.5"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
