"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Film,
  Plus,
  Tv,
  ChevronRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaSourceStudio } from "@/components/admin/sources/MediaSourceStudio";
import { toast } from "sonner";

interface SeasonRecord {
  id: string;
  series_id: string;
  season_number: number;
  title: string | null;
  description: string | null;
  status: string;
  episodes?: EpisodeRecord[];
}

interface EpisodeRecord {
  id: string;
  season_id: string;
  episode_number: number;
  title: string;
  title_bn?: string | null;
  description?: string | null;
  duration_minutes?: number | null;
  air_date?: string | null;
  status: string;
}

interface SeasonEpisodeManagerProps {
  seriesId: string;
  seriesTitle: string;
}

export function SeasonEpisodeManager({
  seriesId,
  seriesTitle,
}: SeasonEpisodeManagerProps) {
  const [seasons, setSeasons] = useState<SeasonRecord[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeRecord[]>([]);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  // Active Episode for Sources Editing
  const [activeEpisodeForSources, setActiveEpisodeForSources] = useState<EpisodeRecord | null>(null);

  // New Season Form
  const [newSeasonNumber, setNewSeasonNumber] = useState(1);
  const [newSeasonTitle, setNewSeasonTitle] = useState("Season 1");

  // New Episode Form
  const [newEpNumber, setNewEpNumber] = useState(1);
  const [newEpTitle, setNewEpTitle] = useState("");
  const [newEpTitleBn, setNewEpTitleBn] = useState("");
  const [newEpDuration, setNewEpDuration] = useState(45);

  const fetchSeasons = async () => {
    setIsLoadingSeasons(true);
    try {
      const res = await fetch(`/api/admin/series/${seriesId}/seasons`);
      if (res.ok) {
        const data = await res.json();
        setSeasons(data.seasons || []);
        if (data.seasons && data.seasons.length > 0 && !activeSeasonId) {
          setActiveSeasonId(data.seasons[0].id);
          setNewSeasonNumber(data.seasons.length + 1);
          setNewSeasonTitle(`Season ${data.seasons.length + 1}`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch seasons:", err);
    } finally {
      setIsLoadingSeasons(false);
    }
  };

  const fetchEpisodes = async (seasonId: string) => {
    setIsLoadingEpisodes(true);
    try {
      const res = await fetch(`/api/admin/seasons/${seasonId}/episodes`);
      if (res.ok) {
        const data = await res.json();
        setEpisodes(data.episodes || []);
        setNewEpNumber((data.episodes?.length || 0) + 1);
        setNewEpTitle(`Episode ${(data.episodes?.length || 0) + 1}`);
      }
    } catch (err) {
      console.error("Failed to fetch episodes:", err);
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoadingSeasons(true);
      try {
        const res = await fetch(`/api/admin/series/${seriesId}/seasons`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setSeasons(data.seasons || []);
          if (data.seasons && data.seasons.length > 0) {
            setActiveSeasonId((prev) => prev || data.seasons[0].id);
            setNewSeasonNumber(data.seasons.length + 1);
            setNewSeasonTitle(`Season ${data.seasons.length + 1}`);
          }
        }
      } catch (err) {
        console.error("Failed to fetch seasons:", err);
      } finally {
        if (isMounted) setIsLoadingSeasons(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [seriesId]);

  useEffect(() => {
    if (!activeSeasonId) return;
    let isMounted = true;
    const loadEp = async () => {
      setIsLoadingEpisodes(true);
      try {
        const res = await fetch(`/api/admin/seasons/${activeSeasonId}/episodes`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setEpisodes(data.episodes || []);
          setNewEpNumber((data.episodes?.length || 0) + 1);
          setNewEpTitle(`Episode ${(data.episodes?.length || 0) + 1}`);
        }
      } catch (err) {
        console.error("Failed to fetch episodes:", err);
      } finally {
        if (isMounted) setIsLoadingEpisodes(false);
      }
    };
    loadEp();
    return () => {
      isMounted = false;
    };
  }, [activeSeasonId]);

  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/series/${seriesId}/seasons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season_number: newSeasonNumber,
          title: newSeasonTitle,
          status: "draft",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create season.");

      toast.success(`Created "${newSeasonTitle}"!`);
      fetchSeasons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create season.";
      toast.error(msg);
    }
  };

  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeasonId) return;

    try {
      const res = await fetch(`/api/admin/seasons/${activeSeasonId}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episode_number: newEpNumber,
          title: newEpTitle,
          title_bn: newEpTitleBn || null,
          duration_minutes: newEpDuration,
          status: "draft",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create episode.");

      toast.success(`Created Episode ${newEpNumber}: "${newEpTitle}"!`);
      setNewEpTitle("");
      setNewEpTitleBn("");
      fetchEpisodes(activeSeasonId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create episode.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-base border border-border shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Tv className="h-4 w-4 text-purple-400" />
            <span>TV Series Studio</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-bold text-text-primary">{seriesTitle}</span>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            Season & Episode Manager
          </h2>
          <p className="text-xs text-text-muted">
            Manage seasons, episode metadata, draft status, and streaming/download links for each episode.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Seasons Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-surface-base border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-400" />
                Seasons ({seasons.length})
              </h3>
            </div>

            {isLoadingSeasons ? (
              <div className="p-6 text-center text-xs text-text-muted">
                Loading seasons...
              </div>
            ) : seasons.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted">
                No seasons created yet.
              </div>
            ) : (
              <div className="space-y-2">
                {seasons.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSeasonId(s.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      activeSeasonId === s.id
                        ? "bg-purple-950/40 border-purple-500/50 text-white font-bold shadow-md"
                        : "bg-surface-raised border-border text-text-secondary hover:bg-surface-raised/80"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{s.title || `Season ${s.season_number}`}</div>
                      <div className="text-[10px] text-text-muted">
                        Season #{s.season_number}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {s.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Create Season Form */}
            <form onSubmit={handleCreateSeason} className="pt-3 border-t border-border space-y-3">
              <h4 className="text-[11px] font-bold text-text-muted uppercase">Add New Season</h4>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  min={1}
                  value={newSeasonNumber}
                  onChange={(e) => setNewSeasonNumber(Number(e.target.value))}
                  placeholder="No."
                  className="h-8 text-xs bg-surface-raised border-border font-mono"
                />
                <Input
                  value={newSeasonTitle}
                  onChange={(e) => setNewSeasonTitle(e.target.value)}
                  placeholder="Season Title"
                  className="col-span-2 h-8 text-xs bg-surface-raised border-border"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs gap-1 border-purple-500/30 text-purple-300 hover:bg-purple-950/40"
              >
                <Plus className="h-3.5 w-3.5" /> Add Season
              </Button>
            </form>
          </div>
        </div>

        {/* Episodes Workspace */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-xl bg-surface-base border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Film className="h-4 w-4 text-purple-400" />
                Episodes List ({episodes.length})
              </h3>
            </div>

            {isLoadingEpisodes ? (
              <div className="p-6 text-center text-xs text-text-muted">
                Loading episode details...
              </div>
            ) : episodes.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted">
                No episodes found for this season. Add an episode below!
              </div>
            ) : (
              <div className="space-y-2">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-4 rounded-xl bg-surface-raised border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-purple-900/40 text-purple-300 font-mono font-bold text-xs flex items-center justify-center border border-purple-500/30">
                          {ep.episode_number}
                        </span>
                        <span className="font-bold text-text-primary text-sm">
                          {ep.title}
                        </span>
                        {ep.title_bn && (
                          <span className="text-xs text-text-muted font-bangla">
                            ({ep.title_bn})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
                        <span>{ep.duration_minutes || 45} mins</span>
                        <span>•</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ep.status === "published"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {ep.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveEpisodeForSources(ep)}
                        className="h-8 text-xs gap-1.5 border-border"
                      >
                        <Play className="h-3 w-3 text-red-400" />
                        <span>Sources</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Episode Form */}
            {activeSeasonId && (
              <form onSubmit={handleCreateEpisode} className="pt-4 border-t border-border space-y-3">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  Add New Episode
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <Input
                    type="number"
                    min={1}
                    value={newEpNumber}
                    onChange={(e) => setNewEpNumber(Number(e.target.value))}
                    placeholder="Ep #"
                    className="h-8 text-xs bg-surface-raised border-border font-mono"
                  />
                  <Input
                    value={newEpTitle}
                    onChange={(e) => setNewEpTitle(e.target.value)}
                    placeholder="English Episode Title"
                    className="sm:col-span-3 h-8 text-xs bg-surface-raised border-border"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={newEpTitleBn}
                    onChange={(e) => setNewEpTitleBn(e.target.value)}
                    placeholder="Bengali Title (বাংলা)"
                    className="h-8 text-xs bg-surface-raised border-border font-bangla"
                  />
                  <Input
                    type="number"
                    value={newEpDuration}
                    onChange={(e) => setNewEpDuration(Number(e.target.value))}
                    placeholder="Duration (mins)"
                    className="h-8 text-xs bg-surface-raised border-border font-mono"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    variant="cinematic"
                    className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Save Episode
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Episode Sources Modal */}
      {activeEpisodeForSources && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface-base border border-border rounded-2xl shadow-2xl overflow-y-auto p-6 space-y-6 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-extrabold text-text-primary">
                  Manage Sources for Ep {activeEpisodeForSources.episode_number}: &quot;{activeEpisodeForSources.title}&quot;
                </h3>
                <p className="text-xs text-text-muted">
                  Configure streaming playback and download sources for this specific episode.
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveEpisodeForSources(null)}
                className="h-8 text-xs"
              >
                Close Workspace
              </Button>
            </div>

            <MediaSourceStudio
              contentType="episode"
              contentId={activeEpisodeForSources.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
