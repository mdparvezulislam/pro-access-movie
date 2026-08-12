"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  Zap,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlaybackSource,
  DownloadSource,
  ContentSourceType,
  VideoQuality,
  DownloadQuality,
} from "@/types/sources";
import { toast } from "sonner";

interface MediaSourceStudioProps {
  contentType: ContentSourceType;
  contentId: string;
}

export function MediaSourceStudio({
  contentType,
  contentId,
}: MediaSourceStudioProps) {
  const [playbackSources, setPlaybackSources] = useState<PlaybackSource[]>([]);
  const [downloadSources, setDownloadSources] = useState<DownloadSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Tab for List View
  const [activeListTab, setActiveListTab] = useState<"playback" | "download">("playback");

  // Form State
  const [sourceName, setSourceName] = useState("Fast HLS Server 1");
  const [streamUrl, setStreamUrl] = useState("");
  const [quality, setQuality] = useState<VideoQuality>("1080p");
  const [language, setLanguage] = useState("English / Bangla Sub");
  const [subtitleUrl, setSubtitleUrl] = useState("");
  const [priority, setPriority] = useState(1);

  // Auto-Sync Download Link State
  const [enableDownloadSync, setEnableDownloadSync] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadLabel, setDownloadLabel] = useState("");
  const [fileSizeBytes, setFileSizeBytes] = useState(1572864000); // 1.5 GB default

  // Update Download fields when streamUrl / quality / sourceName changes if sync enabled
  const handleStreamUrlChange = (val: string) => {
    setStreamUrl(val);
    if (enableDownloadSync) {
      setDownloadUrl(val);
      setDownloadLabel(`Direct Download (${quality}) - ${sourceName}`);
    }
  };

  const handleQualityChange = (newQuality: VideoQuality) => {
    setQuality(newQuality);
    if (enableDownloadSync) {
      setDownloadLabel(`Direct Download (${newQuality}) - ${sourceName}`);
      if (newQuality === "4K") setFileSizeBytes(4294967296); // ~4 GB
      else if (newQuality === "1080p") setFileSizeBytes(1610612736); // ~1.5 GB
      else if (newQuality === "720p") setFileSizeBytes(838860800); // ~800 MB
      else setFileSizeBytes(524288000); // ~500 MB
    }
  };

  const handleSourceNameChange = (name: string) => {
    setSourceName(name);
    if (enableDownloadSync) {
      setDownloadLabel(`Direct Download (${quality}) - ${name}`);
    }
  };

  const fetchAllSources = async () => {
    setIsLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch(`/api/admin/sources/playback?content_type=${contentType}&content_id=${contentId}`),
        fetch(`/api/admin/sources/download?content_type=${contentType}&content_id=${contentId}`),
      ]);

      const [pData, dData] = await Promise.all([pRes.json(), dRes.json()]);

      if (pRes.ok) setPlaybackSources(pData.sources || []);
      if (dRes.ok) setDownloadSources(dData.sources || []);
    } catch (err) {
      console.error("Failed to fetch media sources:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const [pRes, dRes] = await Promise.all([
          fetch(`/api/admin/sources/playback?content_type=${contentType}&content_id=${contentId}`),
          fetch(`/api/admin/sources/download?content_type=${contentType}&content_id=${contentId}`),
        ]);

        const [pData, dData] = await Promise.all([pRes.json(), dRes.json()]);

        if (isMounted) {
          if (pRes.ok) setPlaybackSources(pData.sources || []);
          if (dRes.ok) setDownloadSources(dData.sources || []);
        }
      } catch (err) {
        console.error("Failed to fetch media sources:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [contentType, contentId]);

  const handleSaveSources = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) {
      toast.error("Streaming URL is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Playback Source
      const pRes = await fetch("/api/admin/sources/playback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          source_name: sourceName,
          url: streamUrl.trim(),
          quality,
          language,
          subtitle_url: subtitleUrl.trim() || null,
          priority,
        }),
      });

      const pData = await pRes.json();
      if (!pRes.ok || !pData.success) {
        throw new Error(pData.error || "Failed to add streaming playback source.");
      }

      // 2. Optionally Create Download Source
      if (enableDownloadSync && downloadUrl.trim()) {
        const dRes = await fetch("/api/admin/sources/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: contentType,
            content_id: contentId,
            label: downloadLabel.trim() || `Download (${quality})`,
            url: downloadUrl.trim(),
            quality: quality as DownloadQuality,
            file_size_bytes: fileSizeBytes,
            language,
            priority,
          }),
        });

        const dData = await dRes.json();
        if (!dRes.ok || !dData.success) {
          toast.warning("Streaming source saved, but download link creation failed.");
        }
      }

      toast.success(
        enableDownloadSync
          ? "Successfully saved Streaming & Download Sources!"
          : "Saved Streaming Playback Source!"
      );

      // Reset URL form
      setStreamUrl("");
      setDownloadUrl("");
      setSubtitleUrl("");
      fetchAllSources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save sources.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlayback = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/sources/playback?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Removed playback source.");
        setPlaybackSources(playbackSources.filter((s) => s.id !== id));
      }
    } catch {
      toast.error("Failed to delete playback source.");
    }
  };

  const handleDeleteDownload = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/sources/download?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Removed download link.");
        setDownloadSources(downloadSources.filter((s) => s.id !== id));
      }
    } catch {
      toast.error("Failed to delete download link.");
    }
  };

  const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "Unknown size";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-6 shadow-2xl">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-purple-600/20 text-red-400 font-bold border border-red-500/30 shadow-inner">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
              Media Sources Studio
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                Ultra-Fast Auto-Sync
              </span>
            </h3>
            <p className="text-xs text-text-muted">
              Add streaming servers and direct download links simultaneously with auto-fill intelligence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveListTab("playback")}
            className={`h-8 text-xs gap-1.5 font-bold ${
              activeListTab === "playback"
                ? "bg-red-500/10 text-red-400 border border-red-500/30"
                : "text-text-muted"
            }`}
          >
            <Play className="h-3.5 w-3.5" /> Streams ({playbackSources.length})
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveListTab("download")}
            className={`h-8 text-xs gap-1.5 font-bold ${
              activeListTab === "download"
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                : "text-text-muted"
            }`}
          >
            <Download className="h-3.5 w-3.5" /> Downloads ({downloadSources.length})
          </Button>
        </div>
      </div>

      {/* Unified Fast Source Creator Form */}
      <form
        onSubmit={handleSaveSources}
        className="p-5 rounded-2xl bg-surface-raised border border-border/80 space-y-5 shadow-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-400" />
            Quick Add Streaming & Download Source
          </h4>

          {/* Quick Preset Server Chips */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[10px] text-text-muted mr-1 font-mono">Preset:</span>
            {["Fast HLS 1", "Google Drive CDN", "Vidoza Embed", "Direct MP4"].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => handleSourceNameChange(preset)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                  sourceName === preset
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-surface-base border-border text-text-muted hover:text-text-primary"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Row 1: Server Name, Quality, Language */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Server Name</label>
            <Input
              value={sourceName}
              onChange={(e) => handleSourceNameChange(e.target.value)}
              placeholder="e.g. Fast HLS Server 1"
              className="h-8 text-xs bg-surface-base border-border font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Stream Quality</label>
            <select
              value={quality}
              onChange={(e) => handleQualityChange(e.target.value as VideoQuality)}
              className="w-full h-8 px-2 rounded-lg text-xs font-semibold bg-surface-base border border-border text-text-primary focus:outline-none"
            >
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
              <option value="4K">4K Ultra HD</option>
              <option value="480p">480p SD</option>
              <option value="Auto">Auto Adaptive</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Audio / Subtitle</label>
            <Input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. English / Bangla Sub"
              className="h-8 text-xs bg-surface-base border-border"
            />
          </div>
        </div>

        {/* Row 2: Streaming URL */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
              <Play className="h-3 w-3 text-red-400" />
              Streaming Playback URL (.m3u8, .mp4, or Embed Player) *
            </label>
            <span className="text-[10px] text-text-muted font-mono">
              Auto-fills download URL below
            </span>
          </div>
          <Input
            value={streamUrl}
            onChange={(e) => handleStreamUrlChange(e.target.value)}
            placeholder="https://cdn.example.com/hls/movie_1080p.m3u8"
            className="h-9 text-xs bg-surface-base border-border font-mono text-emerald-400 placeholder:text-text-muted/60"
          />
        </div>

        {/* Row 3: Subtitle URL & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Subtitle VTT URL (Optional)</label>
            <Input
              value={subtitleUrl}
              onChange={(e) => setSubtitleUrl(e.target.value)}
              placeholder="https://cdn.example.com/subs/bengali.vtt"
              className="h-8 text-xs bg-surface-base border-border font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Priority (1 = Highest)</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="h-8 text-xs bg-surface-base border-border font-mono"
            />
          </div>
        </div>

        {/* Auto-Sync Download Source Section */}
        <div className="p-4 rounded-xl bg-surface-base/80 border border-indigo-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableDownloadSync}
                onChange={(e) => setEnableDownloadSync(e.target.checked)}
                className="h-4 w-4 rounded bg-surface-raised border-border text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                Also Create Direct Download Link for Users
              </span>
            </label>

            {enableDownloadSync && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Auto-Synced from Stream URL
              </span>
            )}
          </div>

          {enableDownloadSync && (
            <div className="space-y-3 pt-2 border-t border-border/50 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-muted">Download Display Label</label>
                  <Input
                    value={downloadLabel}
                    onChange={(e) => setDownloadLabel(e.target.value)}
                    placeholder="e.g. Direct Download (1080p)"
                    className="h-8 text-xs bg-surface-raised border-border font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-muted">File Size (Bytes)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={fileSizeBytes}
                      onChange={(e) => setFileSizeBytes(Number(e.target.value))}
                      className="h-8 text-xs bg-surface-raised border-border font-mono flex-1"
                    />
                    <span className="text-[11px] font-mono text-indigo-400 font-bold shrink-0">
                      {formatBytes(fileSizeBytes)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-text-muted">
                  Direct Download Link (Editable if different from Stream URL)
                </label>
                <Input
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="https://downloads.example.com/files/movie_1080p.mkv"
                  className="h-8 text-xs bg-surface-raised border-border font-mono text-indigo-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-text-muted">
            Saves both stream player and download link in a single click.
          </p>

          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            variant="cinematic"
            className="h-9 text-xs gap-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold border-0 shadow-lg shadow-emerald-950/40"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-300" />
            )}
            <span>Save Media Sources</span>
          </Button>
        </div>
      </form>

      {/* Active Sources Table View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" />
            Configured {activeListTab === "playback" ? "Streaming Playback Servers" : "Download Links"}
          </h4>
        </div>

        {activeListTab === "playback" ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised font-bold uppercase tracking-wider text-text-muted border-b border-border">
                <tr>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Server Name</th>
                  <th className="p-3">Quality</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Stream URL</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-text-muted">
                      Loading streaming sources...
                    </td>
                  </tr>
                ) : playbackSources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-text-muted">
                      No streaming sources configured yet. Use the form above to add a source.
                    </td>
                  </tr>
                ) : (
                  playbackSources.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-raised/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-red-400">#{s.priority}</td>
                      <td className="p-3 font-bold text-text-primary">{s.source_name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono font-bold text-[10px] border border-red-500/20">
                          {s.quality}
                        </span>
                      </td>
                      <td className="p-3 text-text-muted">{s.language}</td>
                      <td className="p-3 font-mono text-[11px] text-text-muted truncate max-w-[200px]">
                        {s.url}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-red-400 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Test
                        </a>
                        <button
                          onClick={() => handleDeletePlayback(s.id)}
                          className="text-text-muted hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised font-bold uppercase tracking-wider text-text-muted border-b border-border">
                <tr>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Display Label</th>
                  <th className="p-3">Quality</th>
                  <th className="p-3">File Size</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-text-muted">
                      Loading download links...
                    </td>
                  </tr>
                ) : downloadSources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-text-muted">
                      No download links configured yet.
                    </td>
                  </tr>
                ) : (
                  downloadSources.map((d) => (
                    <tr key={d.id} className="hover:bg-surface-raised/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-400">#{d.priority}</td>
                      <td className="p-3 font-bold text-text-primary">{d.label}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono font-bold text-[10px] border border-indigo-500/20">
                          {d.quality}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-text-muted">
                        {formatBytes(d.file_size_bytes)}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Test Link
                        </a>
                        <button
                          onClick={() => handleDeleteDownload(d.id)}
                          className="text-text-muted hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
