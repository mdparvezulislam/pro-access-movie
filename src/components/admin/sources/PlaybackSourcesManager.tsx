"use client";

import React, { useState, useEffect } from "react";
import {
  PlaySquare,
  Play,
  Download,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PlaybackSource, DownloadSource } from "@/types/sources";

interface ContentItemOption {
  id: string;
  title: string;
  type: "movie" | "series";
}

export function PlaybackSourcesManager() {
  const [activeTab, setActiveTab] = useState<"streaming" | "download">("streaming");
  const [playbackSources, setPlaybackSources] = useState<PlaybackSource[]>([]);
  const [downloadSources, setDownloadSources] = useState<DownloadSource[]>([]);
  const [contentList, setContentList] = useState<ContentItemOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Streaming Modal Form
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [streamMovieId, setStreamMovieId] = useState<string>("");
  const [streamLabel, setStreamLabel] = useState("Fast Server 1");
  const [streamUrl, setStreamUrl] = useState("");
  const [streamQuality, setStreamQuality] = useState<"1080p" | "720p" | "480p" | "360p" | "auto">("1080p");
  const [streamFormat, setStreamFormat] = useState<"hls" | "mp4" | "embed">("hls");
  const [streamPriority, setStreamPriority] = useState(1);

  // Download Modal Form
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [editingDownloadId, setEditingDownloadId] = useState<string | null>(null);
  const [downloadMovieId, setDownloadMovieId] = useState<string>("");
  const [downloadLabel, setDownloadLabel] = useState("Direct Download (1080p)");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadQuality, setDownloadQuality] = useState<"1080p" | "720p" | "480p" | "4K">("1080p");
  const [downloadFileType, setDownloadFileType] = useState<"mp4" | "mkv" | "avi">("mp4");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingType, setDeletingType] = useState<"streaming" | "download" | null>(null);

  const loadData = async () => {
    try {
      const [mRes, sRes, pRes, dRes] = await Promise.all([
        fetch("/api/admin/content?type=movie"),
        fetch("/api/admin/content?type=series"),
        fetch("/api/admin/sources/playback?content_type=movie"),
        fetch("/api/admin/sources/download?content_type=movie"),
      ]);

      const [mData, sData, pData, dData] = await Promise.all([
        mRes.json(),
        sRes.json(),
        pRes.json(),
        dRes.json(),
      ]);

      const movies = (mData.items || []).map((m: { id: string; title: string }) => ({
        id: m.id,
        title: m.title,
        type: "movie" as const,
      }));
      const series = (sData.items || []).map((s: { id: string; title: string }) => ({
        id: s.id,
        title: s.title,
        type: "series" as const,
      }));

      const combined = [...movies, ...series];
      setContentList(combined);
      if (combined.length > 0 && !streamMovieId) {
        setStreamMovieId(combined[0].id);
        setDownloadMovieId(combined[0].id);
      }

      if (pRes.ok) setPlaybackSources(pData.sources || []);
      if (dRes.ok) setDownloadSources(dData.sources || []);
    } catch (err) {
      console.error("Failed to fetch sources:", err);
      toast.error("Could not load media sources.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchInit = async () => {
      try {
        const [mRes, sRes, pRes, dRes] = await Promise.all([
          fetch("/api/admin/content?type=movie"),
          fetch("/api/admin/content?type=series"),
          fetch("/api/admin/sources/playback?content_type=movie"),
          fetch("/api/admin/sources/download?content_type=movie"),
        ]);

        const [mData, sData, pData, dData] = await Promise.all([
          mRes.json(),
          sRes.json(),
          pRes.json(),
          dRes.json(),
        ]);

        if (!active) return;

        const movies = (mData.items || []).map((m: { id: string; title: string }) => ({
          id: m.id,
          title: m.title,
          type: "movie" as const,
        }));
        const series = (sData.items || []).map((s: { id: string; title: string }) => ({
          id: s.id,
          title: s.title,
          type: "series" as const,
        }));

        const combined = [...movies, ...series];
        setContentList(combined);
        if (combined.length > 0) {
          setStreamMovieId(combined[0].id);
          setDownloadMovieId(combined[0].id);
        }

        if (pRes.ok) setPlaybackSources(pData.sources || []);
        if (dRes.ok) setDownloadSources(dData.sources || []);
      } catch (err) {
        console.error("Failed to fetch sources:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchInit();
    return () => {
      active = false;
    };
  }, []);

  // Save Streaming Source
  const handleSaveStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim() || !streamMovieId) {
      toast.error("URL and content selection are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        content_type: "movie",
        content_id: streamMovieId,
        label: streamLabel.trim(),
        quality: streamQuality,
        url: streamUrl.trim(),
        format: streamFormat,
        priority: Number(streamPriority),
        is_active: true,
      };

      const url = editingStreamId
        ? `/api/admin/sources/playback?id=${editingStreamId}`
        : "/api/admin/sources/playback";
      const method = editingStreamId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save streaming source.");

      toast.success(editingStreamId ? "Streaming source updated!" : "Streaming source added!");
      setIsStreamModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Download Source
  const handleSaveDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadUrl.trim() || !downloadMovieId) {
      toast.error("URL and content selection are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        content_type: "movie",
        content_id: downloadMovieId,
        label: downloadLabel.trim(),
        quality: downloadQuality,
        url: downloadUrl.trim(),
        file_type: downloadFileType,
        size_bytes: 1610612736,
        is_active: true,
      };

      const url = editingDownloadId
        ? `/api/admin/sources/download?id=${editingDownloadId}`
        : "/api/admin/sources/download";
      const method = editingDownloadId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save download source.");

      toast.success(editingDownloadId ? "Download source updated!" : "Download source added!");
      setIsDownloadModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (id: string, currentStatus: boolean, type: "streaming" | "download") => {
    try {
      const endpoint = type === "streaming" ? "/api/admin/sources/playback" : "/api/admin/sources/download";
      const res = await fetch(`${endpoint}?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        toast.success(`Source ${!currentStatus ? "enabled" : "disabled"}.`);
        loadData();
      }
    } catch (err) {
      console.error("Failed to toggle source status:", err);
    }
  };

  // Delete Source
  const handleDeleteSource = async () => {
    if (!deletingId || !deletingType) return;
    try {
      const endpoint = deletingType === "streaming" ? "/api/admin/sources/playback" : "/api/admin/sources/download";
      const res = await fetch(`${endpoint}?id=${deletingId}`, { method: "DELETE" });

      if (res.ok) {
        toast.success("Media source deleted.");
        setDeletingId(null);
        setDeletingType(null);
        loadData();
      }
    } catch (err) {
      console.error("Failed to delete source:", err);
      toast.error("Could not delete source.");
    }
  };

  // Filtered Sources
  const filteredStreams = playbackSources.filter((s) => {
    if (searchQuery.trim()) {
      const labelStr = s.label || s.source_name || "";
      return (
        labelStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const filteredDownloads = downloadSources.filter((d) => {
    if (searchQuery.trim()) {
      return (
        d.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-base border border-border shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <PlaySquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Playback & Download Sources Manager
            </h1>
            <p className="text-xs text-text-muted">
              Centralized studio for streaming servers (HLS/MP4/Embed) and direct download links.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingStreamId(null);
              setStreamLabel("Fast Server 1");
              setStreamUrl("");
              setIsStreamModalOpen(true);
            }}
            variant="cinematic"
            className="h-10 text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Streaming Source</span>
          </Button>

          <Button
            onClick={() => {
              setEditingDownloadId(null);
              setDownloadLabel("Direct Download (1080p)");
              setDownloadUrl("");
              setIsDownloadModalOpen(true);
            }}
            variant="outline"
            className="h-10 text-xs gap-1.5 border-border"
          >
            <Plus className="h-4 w-4" />
            <span>Add Download Link</span>
          </Button>
        </div>
      </div>

      {/* Tabs & Toolbar */}
      <div className="p-4 rounded-xl bg-surface-base border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-surface-raised p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("streaming")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "streaming"
                ? "bg-purple-600 text-white shadow-md"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            Streaming ({playbackSources.length})
          </button>

          <button
            onClick={() => setActiveTab("download")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "download"
                ? "bg-purple-600 text-white shadow-md"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Downloads ({downloadSources.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search servers or URLs..."
            className="pl-9 h-9 text-xs bg-surface-raised border-border"
          />
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading media sources...</p>
        </div>
      ) : activeTab === "streaming" ? (
        filteredStreams.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface-base border border-border space-y-3">
            <Play className="h-10 w-10 text-text-muted mx-auto" />
            <h3 className="text-sm font-bold text-text-primary">No Streaming Sources</h3>
            <p className="text-xs text-text-muted">
              Click &apos;Add Streaming Source&apos; to configure HLS or MP4 playback streams.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface-base border border-border shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised/60 text-text-muted font-bold border-b border-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Server Name</th>
                  <th className="py-3 px-4">Format & Quality</th>
                  <th className="py-3 px-4">URL</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStreams.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">
                      P{s.priority}
                    </td>
                    <td className="py-3 px-4 font-bold text-text-primary">
                      {s.label || s.source_name}
                    </td>
                    <td className="py-3 px-4 space-x-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {s.format}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-raised text-text-secondary border border-border">
                        {s.quality}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-muted truncate max-w-xs">
                      {s.url}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                        }`}
                      >
                        {s.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(s.id, s.is_active, "streaming")}
                          className="h-8 w-8 text-text-muted hover:text-text-primary"
                          title={s.is_active ? "Disable" : "Enable"}
                        >
                          {s.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(s.id);
                            setDeletingType("streaming");
                          }}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
        )
      ) : filteredDownloads.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border space-y-3">
          <Download className="h-10 w-10 text-text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">No Download Sources</h3>
          <p className="text-xs text-text-muted">
            Click &apos;Add Download Link&apos; to configure direct download sources.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-base border border-border shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-raised/60 text-text-muted font-bold border-b border-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Download Label</th>
                <th className="py-3 px-4">Quality & Size</th>
                <th className="py-3 px-4">URL</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDownloads.map((d) => (
                <tr key={d.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-text-primary">
                    {d.label}
                  </td>
                  <td className="py-3 px-4 space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {d.quality}
                    </span>
                    <span className="font-mono text-text-muted text-[11px]">
                      {(((d.size_bytes || d.file_size_bytes || 0)) / (1024 * 1024 * 1024)).toFixed(1)} GB
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-text-muted truncate max-w-xs">
                    {d.url}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                      }`}
                    >
                      {d.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(d.id, d.is_active, "download")}
                        className="h-8 w-8 text-text-muted hover:text-text-primary"
                      >
                        {d.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(d.id);
                          setDeletingType("download");
                        }}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
      )}

      {/* STREAMING MODAL */}
      {isStreamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-purple-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <Play className="h-4 w-4 text-purple-400" /> Add Streaming Source
              </h3>
              <button onClick={() => setIsStreamModalOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStream} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Target Content *</label>
                <select
                  value={streamMovieId}
                  onChange={(e) => setStreamMovieId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-medium"
                >
                  {contentList.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.type.toUpperCase()}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Server Name *</label>
                <Input
                  value={streamLabel}
                  onChange={(e) => setStreamLabel(e.target.value)}
                  required
                  placeholder="e.g. Fast Server 1"
                  className="h-10 text-xs bg-surface-raised border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Stream URL (.m3u8 / .mp4 / iframe) *</label>
                <Input
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  required
                  placeholder="https://cdn.example.com/stream.m3u8"
                  className="h-10 text-xs bg-surface-raised border-border font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Format</label>
                  <select
                    value={streamFormat}
                    onChange={(e) => setStreamFormat(e.target.value as "hls" | "mp4" | "embed")}
                    className="w-full h-9 px-2 rounded-lg bg-surface-raised border border-border text-text-primary font-bold"
                  >
                    <option value="hls">HLS</option>
                    <option value="mp4">MP4</option>
                    <option value="embed">Embed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Quality</label>
                  <select
                    value={streamQuality}
                    onChange={(e) => setStreamQuality(e.target.value as "1080p" | "720p" | "480p" | "360p" | "auto")}
                    className="w-full h-9 px-2 rounded-lg bg-surface-raised border border-border text-text-primary font-bold"
                  >
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Priority</label>
                  <Input
                    type="number"
                    min={1}
                    value={streamPriority}
                    onChange={(e) => setStreamPriority(Number(e.target.value))}
                    className="h-9 text-xs bg-surface-raised border-border font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsStreamModalOpen(false)} disabled={isSubmitting} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="cinematic" disabled={isSubmitting} className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Save Stream</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOWNLOAD MODAL */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-purple-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <Download className="h-4 w-4 text-purple-400" /> Add Download Source
              </h3>
              <button onClick={() => setIsDownloadModalOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDownload} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Target Content *</label>
                <select
                  value={downloadMovieId}
                  onChange={(e) => setDownloadMovieId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-medium"
                >
                  {contentList.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.type.toUpperCase()}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Download Label *</label>
                <Input
                  value={downloadLabel}
                  onChange={(e) => setDownloadLabel(e.target.value)}
                  required
                  placeholder="e.g. Direct Download (1080p)"
                  className="h-10 text-xs bg-surface-raised border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Direct Download URL *</label>
                <Input
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  required
                  placeholder="https://cdn.example.com/download.mp4"
                  className="h-10 text-xs bg-surface-raised border-border font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Quality</label>
                  <select
                    value={downloadQuality}
                    onChange={(e) => setDownloadQuality(e.target.value as "1080p" | "720p" | "480p" | "4K")}
                    className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                  >
                    <option value="4K">4K Ultra HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                    <option value="480p">480p SD</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">File Format</label>
                  <select
                    value={downloadFileType}
                    onChange={(e) => setDownloadFileType(e.target.value as "mp4" | "mkv" | "avi")}
                    className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                  >
                    <option value="mp4">MP4</option>
                    <option value="mkv">MKV</option>
                    <option value="avi">AVI</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsDownloadModalOpen(false)} disabled={isSubmitting} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="cinematic" disabled={isSubmitting} className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Save Link</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-extrabold text-text-primary">Confirm Deletion</h3>
            <p className="text-xs text-text-muted">Are you sure you want to delete this media source?</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)} className="h-9 text-xs">Cancel</Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteSource} className="h-9 text-xs">Confirm Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
