"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ListVideo,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Loader2,
  Tv,
  Layers,
  X,
  AlertTriangle,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { MediaSourceStudio } from "@/components/admin/sources/MediaSourceStudio";
import { toast } from "sonner";

interface SeriesItem {
  id: string;
  title: string;
}

interface SeasonOption {
  id: string;
  season_number: number;
  title: string | null;
  series_id: string;
}

interface EpisodeItem {
  id: string;
  season_id: string;
  episode_number: number;
  title: string;
  title_bn: string | null;
  description: string | null;
  duration_minutes: number | null;
  air_date: string | null;
  status: string;
  media?: { posterUrl?: string; posterPath?: string; thumbnailPath?: string } | null;
  season?: {
    id: string;
    season_number: number;
    series?: { id: string; title: string } | null;
  } | null;
  created_at?: string;
}

export function EpisodesManager() {
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [seasonsList, setSeasonsList] = useState<SeasonOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("all");
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeSourcesEpisode, setActiveSourcesEpisode] = useState<EpisodeItem | null>(null);

  // Form States
  const [formSeasonId, setFormSeasonId] = useState<string>("");
  const [formEpNumber, setFormEpNumber] = useState<number>(1);
  const [formTitle, setFormTitle] = useState<string>("Episode 1");
  const [formTitleBn, setFormTitleBn] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formDuration, setFormDuration] = useState<number>(45);
  const [formAirDate, setFormAirDate] = useState<string>("");
  const [formStatus, setFormStatus] = useState<string>("draft");
  const [formThumbPath, setFormThumbPath] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deletingEpisode, setDeletingEpisode] = useState<EpisodeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Series List
  const fetchSeries = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content?type=series");
      if (res.ok) {
        const data = await res.json();
        setSeriesList(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch series:", err);
    }
  }, []);

  // Fetch Seasons List
  const fetchSeasons = useCallback(async (seriesId?: string) => {
    try {
      const url = seriesId && seriesId !== "all"
        ? `/api/admin/seasons?series_id=${seriesId}`
        : "/api/admin/seasons";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSeasonsList(data.seasons || []);
        if (data.seasons && data.seasons.length > 0 && !formSeasonId) {
          setFormSeasonId(data.seasons[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch seasons:", err);
    }
  }, [formSeasonId]);

  // Fetch Episodes
  const fetchEpisodes = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/episodes?season_id=${selectedSeasonId}&status=${selectedStatus}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEpisodes(data.episodes || []);
      }
    } catch (err) {
      console.error("Failed to fetch episodes:", err);
      toast.error("Could not load episodes.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSeasonId, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchSeries();
    fetchSeasons();
  }, [fetchSeries, fetchSeasons]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  const handleSeriesFilterChange = (val: string) => {
    setSelectedSeriesId(val);
    setSelectedSeasonId("all");
    fetchSeasons(val);
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    if (seasonsList.length > 0) {
      setFormSeasonId(seasonsList[0].id);
    }
    setFormEpNumber((episodes.length || 0) + 1);
    setFormTitle(`Episode ${(episodes.length || 0) + 1}`);
    setFormTitleBn("");
    setFormDescription("");
    setFormDuration(45);
    setFormAirDate("");
    setFormStatus("draft");
    setFormThumbPath("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: EpisodeItem) => {
    setEditingId(item.id);
    setFormSeasonId(item.season_id);
    setFormEpNumber(item.episode_number);
    setFormTitle(item.title);
    setFormTitleBn(item.title_bn || "");
    setFormDescription(item.description || "");
    setFormDuration(item.duration_minutes || 45);
    setFormAirDate(item.air_date ? item.air_date.slice(0, 10) : "");
    setFormStatus(item.status || "draft");
    setFormThumbPath(item.media?.thumbnailPath || item.media?.posterUrl || "");
    setIsModalOpen(true);
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSeasonId) {
      toast.error("Please select a season.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        season_id: formSeasonId,
        episode_number: Number(formEpNumber),
        title: formTitle.trim(),
        title_bn: formTitleBn.trim() || null,
        description: formDescription.trim(),
        duration_minutes: Number(formDuration),
        air_date: formAirDate || null,
        status: formStatus,
        media: { thumbnailPath: formThumbPath, posterUrl: formThumbPath },
      };

      const url = editingId ? `/api/admin/episodes/${editingId}` : "/api/admin/episodes";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save episode.");
      }

      toast.success(editingId ? "Episode updated!" : "Episode created!");
      setIsModalOpen(false);
      fetchEpisodes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save episode.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEpisode = async () => {
    if (!deletingEpisode) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/episodes/${deletingEpisode.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not delete episode.");
      }

      toast.success("Episode deleted.");
      setDeletingEpisode(null);
      fetchEpisodes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete episode.";
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
            <ListVideo className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Episodes Management
            </h1>
            <p className="text-xs text-text-muted">
              Manage episodes, sequencing, air dates, and playback/download sources.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="cinematic"
          className="h-10 text-xs gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Episode</span>
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
              placeholder="Search episodes by title or description..."
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
              onChange={(e) => handleSeriesFilterChange(e.target.value)}
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

          {/* Season Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted whitespace-nowrap">
              Season:
            </span>
            <select
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary"
            >
              <option value="all">All Seasons ({seasonsList.length})</option>
              {seasonsList.map((s) => (
                <option key={s.id} value={s.id}>
                  Season {s.season_number} {s.title ? `(${s.title})` : ""}
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
          <p className="text-xs text-text-muted">Loading episodes from database...</p>
        </div>
      ) : episodes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border space-y-3">
          <ListVideo className="h-10 w-10 text-text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">No Episodes Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {searchQuery || selectedSeasonId !== "all"
              ? "No episodes match your active filters."
              : "No episodes created yet. Click 'Add Episode' to create one."}
          </p>
          <Button
            onClick={handleOpenCreateModal}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-border"
          >
            Create Episode
          </Button>
        </div>
      ) : (
        <>
          {/* DESKTOP DATA TABLE (md:block) */}
          <div className="hidden md:block rounded-2xl bg-surface-base border border-border shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised/60 text-text-muted font-bold border-b border-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Episode</th>
                  <th className="py-3 px-4">Series & Season</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {episodes.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-raised/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-text-primary">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-xs font-bold border border-purple-500/20">
                        EP {item.episode_number}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-medium">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 font-bold text-text-primary">
                          <Tv className="h-3 w-3 text-purple-400" />
                          <span>{item.season?.series?.title || "Series"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-text-muted">
                          <Layers className="h-3 w-3" />
                          <span>Season {item.season?.season_number || 1}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-text-primary">
                      <div>
                        <span>{item.title}</span>
                        {item.title_bn && (
                          <span className="text-[11px] font-bangla text-purple-300 block">
                            {item.title_bn}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {item.duration_minutes || 45} mins
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
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
                          size="sm"
                          onClick={() => setActiveSourcesEpisode(item)}
                          className="h-8 text-[11px] gap-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20"
                        >
                          <Play className="h-3 w-3" /> Sources
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(item)}
                          className="h-8 w-8 text-text-muted hover:text-text-primary"
                          title="Edit Episode"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingEpisode(item)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          title="Delete Episode"
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
            {episodes.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-surface-base border border-border shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-xs font-bold border border-purple-500/20">
                      EP {item.episode_number}
                    </span>
                    <h4 className="text-xs font-bold text-text-primary">
                      {item.title}
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

                <div className="text-[11px] text-text-muted space-y-1">
                  <p>Series: {item.season?.series?.title || "Series"} (S{item.season?.season_number || 1})</p>
                  <p>Runtime: {item.duration_minutes || 45} mins</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSourcesEpisode(item)}
                    className="h-8 text-xs gap-1 border-purple-500/30 text-purple-400"
                  >
                    <Play className="h-3 w-3" /> Media Sources
                  </Button>
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
                    onClick={() => setDeletingEpisode(item)}
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

      {/* CREATE / EDIT EPISODE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-surface-base border border-purple-500/30 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <ListVideo className="h-4 w-4 text-purple-400" />
                {editingId ? "Edit Episode" : "Create New Episode"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEpisode} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Parent Season *</label>
                <select
                  value={formSeasonId}
                  onChange={(e) => setFormSeasonId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-medium"
                >
                  {seasonsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      Season {s.season_number} {s.title ? `(${s.title})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Episode Number *</label>
                  <Input
                    type="number"
                    min={1}
                    value={formEpNumber}
                    onChange={(e) => setFormEpNumber(Number(e.target.value))}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">English Title *</label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    placeholder="e.g. Episode 1: The Beginning"
                    className="h-10 text-xs bg-surface-raised border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Bengali Title (বাংলা)</label>
                  <Input
                    value={formTitleBn}
                    onChange={(e) => setFormTitleBn(e.target.value)}
                    placeholder="বাংলা এপিোড নাম..."
                    className="h-10 text-xs bg-surface-raised border-border font-bangla"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Duration (Minutes)</label>
                  <Input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="h-10 text-xs bg-surface-raised border-border font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Air Date</label>
                  <Input
                    type="date"
                    value={formAirDate}
                    onChange={(e) => setFormAirDate(e.target.value)}
                    className="h-10 text-xs bg-surface-raised border-border"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Episode Synopsis</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Episode summary..."
                  className="w-full p-3 rounded-xl bg-surface-raised border border-border text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Thumbnail Image Asset</label>
                <MediaPicker
                  label="Episode Thumbnail"
                  value={formThumbPath}
                  onChange={(path) => setFormThumbPath(path)}
                  aspectRatio="backdrop"
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
                  <span>{editingId ? "Update Episode" : "Create Episode"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EPISODE SOURCES MANAGEMENT MODAL */}
      {activeSourcesEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-surface-base border border-purple-500/30 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                  <Play className="h-4 w-4 text-purple-400" />
                  Media Sources — EP {activeSourcesEpisode.episode_number}: {activeSourcesEpisode.title}
                </h3>
                <p className="text-xs text-text-muted">
                  Add and manage streaming servers & direct download links for this episode.
                </p>
              </div>

              <button
                onClick={() => setActiveSourcesEpisode(null)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <MediaSourceStudio contentType="episode" contentId={activeSourcesEpisode.id} />
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-extrabold text-text-primary">
                Delete Episode EP {deletingEpisode.episode_number}?
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Are you sure you want to delete <strong className="text-text-primary">"{deletingEpisode.title}"</strong>? All connected streaming and download sources will be deleted.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingEpisode(null)}
                disabled={isDeleting}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteEpisode}
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
