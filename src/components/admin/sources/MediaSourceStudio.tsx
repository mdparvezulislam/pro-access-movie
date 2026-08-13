"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Play,
  Download,
  Plus,
  Trash2,
  Loader2,
  Edit3,
  Eye,
  EyeOff,
  Server,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle2,
  Globe,
  FileType,
  Sparkles,
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
  StreamFormat,
  DownloadFileType,
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

  // Active Tab: playback | download
  const [activeTab, setActiveTab] = useState<"playback" | "download">("playback");

  // Modal / Drawer Open State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Streaming Form State
  const [sourceName, setSourceName] = useState("Fast HLS Server 1");
  const [streamUrl, setStreamUrl] = useState("");
  const [streamFormat, setStreamFormat] = useState<StreamFormat>("hls");
  const [quality, setQuality] = useState<VideoQuality>("1080p");
  const [language, setLanguage] = useState("English / Bangla Sub");
  const [subtitleUrl, setSubtitleUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState(1);

  // Download Form State
  const [downloadLabel, setDownloadLabel] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadQuality, setDownloadQuality] = useState<DownloadQuality>("1080p");
  const [fileType, setFileType] = useState<DownloadFileType>("mp4");
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(1610612736); // ~1.5GB default
  const [downloadLanguage, setDownloadLanguage] = useState("English / Bangla Sub");

  // Connection Checkbox (Sync stream -> download)
  const [enableDownloadSync, setEnableDownloadSync] = useState(true);

  // 1. Fetch Sources
  const fetchAllSources = useCallback(async () => {
    if (!contentId) return;
    setIsLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch(`/api/admin/sources/playback?content_type=${contentType}&content_id=${contentId}`),
        fetch(`/api/admin/sources/download?content_type=${contentType}&content_id=${contentId}`),
      ]);

      const [pData, dData] = await Promise.all([pRes.json(), dRes.json()]);

      if (pRes.ok) setPlaybackSources(pData.sources || []);
      else toast.error(pData.error || "Failed to load playback sources");

      if (dRes.ok) setDownloadSources(dData.sources || []);
      else toast.error(dData.error || "Failed to load download sources");
    } catch (err) {
      console.error("Failed to fetch media sources:", err);
      toast.error("Network error fetching media sources.");
    } finally {
      setIsLoading(false);
    }
  }, [contentType, contentId]);

  useEffect(() => {
    fetchAllSources();
  }, [fetchAllSources]);

  // Stream URL auto detection
  const handleStreamUrlChange = (val: string) => {
    setStreamUrl(val);
    if (val.includes(".m3u8")) setStreamFormat("hls");
    else if (val.includes(".mp4")) setStreamFormat("mp4");
    else if (val.includes("<iframe") || val.includes("embed")) setStreamFormat("embed");

    if (enableDownloadSync && activeTab === "playback") {
      setDownloadUrl(val);
      setDownloadLabel(`Direct Download (${quality}) - ${sourceName}`);
    }
  };

  // Quality Change handler
  const handleQualityChange = (q: VideoQuality) => {
    setQuality(q);
    setDownloadQuality(q as DownloadQuality);
    if (q === "4K") setFileSizeBytes(4294967296);
    else if (q === "1080p") setFileSizeBytes(1610612736);
    else if (q === "720p") setFileSizeBytes(838860800);
    else setFileSizeBytes(419430400);

    if (enableDownloadSync) {
      setDownloadLabel(`Direct Download (${q}) - ${sourceName}`);
    }
  };

  // Open Modal for Create or Edit
  const openAddModal = (tab: "playback" | "download") => {
    setActiveTab(tab);
    setEditingId(null);
    if (tab === "playback") {
      setSourceName(`Fast ${tab === "playback" ? "HLS" : "Download"} Server ${playbackSources.length + 1}`);
      setStreamUrl("");
      setStreamFormat("hls");
      setQuality("1080p");
      setLanguage("English / Bangla Sub");
      setSubtitleUrl("");
      setNotes("");
      setPriority(playbackSources.length + 1);
      setDownloadUrl("");
      setDownloadLabel("");
    } else {
      setDownloadLabel(`Direct Server (${downloadSources.length + 1}) - 1080p`);
      setDownloadUrl("");
      setDownloadQuality("1080p");
      setFileType("mp4");
      setFileSizeBytes(1610612736);
      setDownloadLanguage("English / Bangla Sub");
      setPriority(downloadSources.length + 1);
    }
    setIsModalOpen(true);
  };

  const openEditPlaybackModal = (s: PlaybackSource) => {
    setActiveTab("playback");
    setEditingId(s.id);
    setSourceName(s.source_name);
    setStreamUrl(s.url);
    setStreamFormat(s.format || "hls");
    setQuality(s.quality);
    setLanguage(s.language || "English");
    setSubtitleUrl(s.subtitle_url || "");
    setNotes(s.notes || "");
    setPriority(s.priority || 1);
    setIsModalOpen(true);
  };

  const openEditDownloadModal = (d: DownloadSource) => {
    setActiveTab("download");
    setEditingId(d.id);
    setDownloadLabel(d.label);
    setDownloadUrl(d.url);
    setDownloadQuality(d.quality);
    setFileType(d.file_type || "mp4");
    setFileSizeBytes(d.file_size_bytes || 1610612736);
    setDownloadLanguage(d.language || "English");
    setPriority(d.priority || 1);
    setIsModalOpen(true);
  };

  // 2. Save Streaming Source
  const handleSavePlaybackSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) {
      toast.error("Streaming URL is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingId);
      const urlEndpoint = "/api/admin/sources/playback";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        ...(isEditing ? { id: editingId } : { content_type: contentType, content_id: contentId }),
        source_name: sourceName.trim(),
        url: streamUrl.trim(),
        format: streamFormat,
        quality,
        language,
        subtitle_url: subtitleUrl.trim() || null,
        notes: notes.trim() || null,
        priority: Number(priority),
      };

      const res = await fetch(urlEndpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save streaming source.");
      }

      // Auto create connected download link if enabled
      if (!isEditing && enableDownloadSync && downloadUrl.trim()) {
        await fetch("/api/admin/sources/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: contentType,
            content_id: contentId,
            label: downloadLabel.trim() || `Download (${quality}) - ${sourceName}`,
            url: downloadUrl.trim(),
            quality: quality as DownloadQuality,
            file_type: fileType,
            file_size_bytes: fileSizeBytes,
            language,
            priority: Number(priority),
          }),
        }).catch(() => {});
      }

      toast.success(isEditing ? "Updated Streaming Source!" : "Saved Streaming Source!");
      setIsModalOpen(false);
      await fetchAllSources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save streaming source.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Save Download Source
  const handleSaveDownloadSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadUrl.trim()) {
      toast.error("Download URL is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingId);
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        ...(isEditing ? { id: editingId } : { content_type: contentType, content_id: contentId }),
        label: downloadLabel.trim() || `Download (${downloadQuality})`,
        url: downloadUrl.trim(),
        quality: downloadQuality,
        file_type: fileType,
        file_size_bytes: Number(fileSizeBytes),
        language: downloadLanguage,
        priority: Number(priority),
      };

      const res = await fetch("/api/admin/sources/download", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save download source.");
      }

      toast.success(isEditing ? "Updated Download Source!" : "Saved Download Source!");
      setIsModalOpen(false);
      await fetchAllSources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save download source.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Toggle Active Status
  const handleTogglePlaybackActive = async (s: PlaybackSource) => {
    try {
      const res = await fetch("/api/admin/sources/playback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, is_active: !s.is_active }),
      });
      if (res.ok) {
        toast.success(`Stream "${s.source_name}" ${s.is_active ? "disabled" : "enabled"}.`);
        setPlaybackSources(playbackSources.map((item) => (item.id === s.id ? { ...item, is_active: !item.is_active } : item)));
      } else {
        toast.error("Failed to toggle stream status.");
      }
    } catch {
      toast.error("Network error toggling status.");
    }
  };

  const handleToggleDownloadActive = async (d: DownloadSource) => {
    try {
      const res = await fetch("/api/admin/sources/download", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: d.id, is_active: !d.is_active }),
      });
      if (res.ok) {
        toast.success(`Download link "${d.label}" ${d.is_active ? "disabled" : "enabled"}.`);
        setDownloadSources(downloadSources.map((item) => (item.id === d.id ? { ...item, is_active: !item.is_active } : item)));
      } else {
        toast.error("Failed to toggle download status.");
      }
    } catch {
      toast.error("Network error toggling status.");
    }
  };

  // 5. Delete Sources
  const handleDeletePlayback = async (id: string, name: string) => {
    if (!confirm(`Delete stream "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/sources/playback?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Stream deleted.");
        setPlaybackSources(playbackSources.filter((s) => s.id !== id));
      } else {
        toast.error("Failed to delete stream.");
      }
    } catch {
      toast.error("Failed to delete stream.");
    }
  };

  const handleDeleteDownload = async (id: string, label: string) => {
    if (!confirm(`Delete download link "${label}"?`)) return;
    try {
      const res = await fetch(`/api/admin/sources/download?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Download link deleted.");
        setDownloadSources(downloadSources.filter((d) => d.id !== id));
      } else {
        toast.error("Failed to delete download link.");
      }
    } catch {
      toast.error("Failed to delete download link.");
    }
  };

  // 6. Priority Reordering (Move Up / Move Down)
  const handleReorder = async (type: "playback" | "download", index: number, direction: "up" | "down") => {
    const list = type === "playback" ? [...playbackSources] : [...downloadSources];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap elements
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Re-assign priority values
    const updatedItems = list.map((item, idx) => ({ ...item, priority: idx + 1 }));

    if (type === "playback") setPlaybackSources(updatedItems as PlaybackSource[]);
    else setDownloadSources(updatedItems as DownloadSource[]);

    try {
      const res = await fetch("/api/admin/sources/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: type,
          items: updatedItems.map((i) => ({ id: i.id, priority: i.priority })),
        }),
      });
      if (res.ok) {
        toast.success("Reordered priorities saved!");
      } else {
        toast.error("Failed to save reordered priority.");
        fetchAllSources();
      }
    } catch {
      toast.error("Error reordering sources.");
      fetchAllSources();
    }
  };

  // Format Bytes helper
  const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "Unknown size";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
            <Server className="h-5 w-5 text-red-500" />
            Media Sources Studio V2
          </h3>
          <p className="text-xs text-text-muted">
            Configure, prioritize, and enable/disable production streaming servers and direct downloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("playback")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              activeTab === "playback"
                ? "bg-red-600/20 text-red-400 border-red-500/40"
                : "bg-surface-raised text-text-muted border-border hover:text-text-primary"
            }`}
          >
            <Play className="h-3.5 w-3.5" /> Streams ({playbackSources.length})
          </button>
          <button
            onClick={() => setActiveTab("download")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              activeTab === "download"
                ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40"
                : "bg-surface-raised text-text-muted border-border hover:text-text-primary"
            }`}
          >
            <Download className="h-3.5 w-3.5" /> Downloads ({downloadSources.length})
          </button>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <Layers className="h-4 w-4 text-red-400" />
          Active {activeTab === "playback" ? "Streaming Sources" : "Download Sources"}
        </h4>

        <Button
          onClick={() => openAddModal(activeTab)}
          variant="cinematic"
          className={`text-xs h-9 gap-1.5 font-bold ${
            activeTab === "download" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Add {activeTab === "playback" ? "Streaming Source" : "Download Link"}</span>
        </Button>
      </div>

      {/* Source List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-text-muted flex items-center justify-center gap-2 rounded-xl bg-surface-raised/30 border border-border">
          <Loader2 className="h-4 w-4 animate-spin text-red-500" /> Loading sources from Supabase...
        </div>
      ) : activeTab === "playback" ? (
        playbackSources.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface-raised/30 border border-dashed border-border space-y-3">
            <Server className="h-8 w-8 text-text-muted mx-auto opacity-50" />
            <p className="text-xs text-text-muted font-medium">No streaming sources saved yet.</p>
            <Button onClick={() => openAddModal("playback")} size="sm" variant="outline" className="text-xs font-bold gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Streaming Source
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {playbackSources.map((s, index) => (
              <div
                key={s.id}
                className={`p-4 rounded-xl bg-surface-raised border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  s.is_active ? "border-border" : "border-red-950/40 bg-surface-raised/40 opacity-75"
                }`}
              >
                <div className="flex items-center gap-3.5 truncate">
                  <button
                    onClick={() => handleTogglePlaybackActive(s)}
                    title={s.is_active ? "Click to Disable" : "Click to Enable"}
                    className={`p-2 rounded-lg transition-colors border ${
                      s.is_active
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                    }`}
                  >
                    {s.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  <div className="truncate space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs text-text-primary">{s.source_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 border border-red-500/30 text-red-400 font-mono">
                        {s.quality}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-base border border-border text-text-muted uppercase">
                        {s.format || "HLS"}
                      </span>
                      {s.language && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-base border border-border text-text-muted">
                          {s.language}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
                        Priority #{s.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-text-muted font-mono truncate max-w-xl">{s.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    disabled={index === 0}
                    onClick={() => handleReorder("playback", index, "up")}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-base disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    disabled={index === playbackSources.length - 1}
                    onClick={() => handleReorder("playback", index, "down")}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-base disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditPlaybackModal(s)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-amber-400 hover:bg-surface-base"
                    title="Edit Source"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlayback(s.id, s.source_name)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-surface-base"
                    title="Delete Source"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : downloadSources.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-surface-raised/30 border border-dashed border-border space-y-3">
          <Download className="h-8 w-8 text-text-muted mx-auto opacity-50" />
          <p className="text-xs text-text-muted font-medium">No download links saved yet.</p>
          <Button onClick={() => openAddModal("download")} size="sm" variant="outline" className="text-xs font-bold gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Download Source
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {downloadSources.map((d, index) => (
            <div
              key={d.id}
              className={`p-4 rounded-xl bg-surface-raised border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                d.is_active ? "border-border" : "border-red-950/40 bg-surface-raised/40 opacity-75"
              }`}
            >
              <div className="flex items-center gap-3.5 truncate">
                <button
                  onClick={() => handleToggleDownloadActive(d)}
                  title={d.is_active ? "Click to Disable" : "Click to Enable"}
                  className={`p-2 rounded-lg transition-colors border ${
                    d.is_active
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                  }`}
                >
                  {d.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>

                <div className="truncate space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-xs text-text-primary">{d.label}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-mono">
                      {d.quality}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-base border border-border text-text-muted font-mono">
                      {formatBytes(d.file_size_bytes)}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
                      Priority #{d.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-text-muted font-mono truncate max-w-xl">{d.url}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  disabled={index === 0}
                  onClick={() => handleReorder("download", index, "up")}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-base disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Move Up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  disabled={index === downloadSources.length - 1}
                  onClick={() => handleReorder("download", index, "down")}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-base disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Move Down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openEditDownloadModal(d)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-amber-400 hover:bg-surface-base"
                  title="Edit Download Link"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteDownload(d.id, d.label)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-surface-base"
                  title="Delete Download Link"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Compact Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl p-6 rounded-2xl bg-surface-base border border-border shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                {activeTab === "playback" ? <Play className="h-4 w-4 text-red-500" /> : <Download className="h-4 w-4 text-emerald-500" />}
                <span>
                  {editingId
                    ? activeTab === "playback"
                      ? "Edit Streaming Source"
                      : "Edit Download Link"
                    : activeTab === "playback"
                    ? "Add New Streaming Source"
                    : "Add Direct Download Link"}
                </span>
              </h3>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeTab === "playback" ? (
              <form onSubmit={handleSavePlaybackSource} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Server / Provider Name</label>
                    <Input
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      required
                      placeholder="e.g. Fast CDN Server 1"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Video Quality</label>
                    <select
                      value={quality}
                      onChange={(e) => handleQualityChange(e.target.value as VideoQuality)}
                      className="w-full h-9 px-3 rounded-lg text-xs font-bold bg-surface-raised border border-border text-text-primary"
                    >
                      <option value="4K">4K Ultra HD</option>
                      <option value="1080p">1080p Full HD</option>
                      <option value="720p">720p HD</option>
                      <option value="480p">480p SD</option>
                      <option value="Auto">Auto Quality</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">Stream URL (HLS .m3u8, MP4, or Embed)</label>
                  <Input
                    value={streamUrl}
                    onChange={(e) => handleStreamUrlChange(e.target.value)}
                    required
                    placeholder="https://..."
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Stream Format</label>
                    <select
                      value={streamFormat}
                      onChange={(e) => setStreamFormat(e.target.value as StreamFormat)}
                      className="w-full h-9 px-3 rounded-lg text-xs font-bold bg-surface-raised border border-border text-text-primary"
                    >
                      <option value="hls">HLS (.m3u8 stream)</option>
                      <option value="mp4">MP4 Direct Video</option>
                      <option value="embed">Embed (Iframe/Player)</option>
                      <option value="other">Other Stream Type</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Priority Rank (1 = Highest)</label>
                    <Input
                      type="number"
                      min={1}
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      required
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Audio / Subtitle Info</label>
                    <Input
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="e.g. English / Bangla Sub"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Subtitle Track VTT URL (Optional)</label>
                    <Input
                      value={subtitleUrl}
                      onChange={(e) => setSubtitleUrl(e.target.value)}
                      placeholder="https://.../subtitles.vtt"
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                {!editingId && (
                  <div className="p-3 rounded-xl bg-surface-raised/60 border border-border space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableDownloadSync}
                        onChange={(e) => setEnableDownloadSync(e.target.checked)}
                        className="rounded border-border accent-red-600"
                      />
                      Auto-create matching Direct Download link
                    </label>

                    {enableDownloadSync && (
                      <div className="pl-6 space-y-2">
                        <Input
                          value={downloadLabel}
                          onChange={(e) => setDownloadLabel(e.target.value)}
                          placeholder="Download Label"
                          className="h-8 text-xs bg-surface-base"
                        />
                        <Input
                          value={downloadUrl}
                          onChange={(e) => setDownloadUrl(e.target.value)}
                          placeholder="Download Direct URL"
                          className="h-8 text-xs font-mono bg-surface-base"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs h-9">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} variant="cinematic" className="text-xs h-9 gap-1.5 font-bold">
                    {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span>{editingId ? "Update Stream" : "Save Stream"}</span>
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveDownloadSource} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Display Label</label>
                    <Input
                      value={downloadLabel}
                      onChange={(e) => setDownloadLabel(e.target.value)}
                      required
                      placeholder="e.g. Direct High-Speed Download (1080p)"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Quality</label>
                    <select
                      value={downloadQuality}
                      onChange={(e) => setDownloadQuality(e.target.value as DownloadQuality)}
                      className="w-full h-9 px-3 rounded-lg text-xs font-bold bg-surface-raised border border-border text-text-primary"
                    >
                      <option value="4K">4K Ultra HD</option>
                      <option value="1080p">1080p Full HD</option>
                      <option value="720p">720p HD</option>
                      <option value="480p">480p SD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">Direct Download URL</label>
                  <Input
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    required
                    placeholder="https://..."
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">File Type</label>
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value as DownloadFileType)}
                      className="w-full h-9 px-3 rounded-lg text-xs font-bold bg-surface-raised border border-border text-text-primary"
                    >
                      <option value="mp4">MP4 Video</option>
                      <option value="mkv">MKV Container</option>
                      <option value="zip">ZIP Archive</option>
                      <option value="other">Other Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Estimated File Size (Bytes)</label>
                    <Input
                      type="number"
                      value={fileSizeBytes}
                      onChange={(e) => setFileSizeBytes(Number(e.target.value))}
                      className="h-9 text-xs font-mono"
                    />
                    <span className="text-[10px] text-text-muted mt-0.5 block">Formatted: {formatBytes(fileSizeBytes)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Language / Subtitle Info</label>
                    <Input
                      value={downloadLanguage}
                      onChange={(e) => setDownloadLanguage(e.target.value)}
                      placeholder="e.g. English / Bangla Sub"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">Priority Rank (1 = Highest)</label>
                    <Input
                      type="number"
                      min={1}
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      required
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs h-9">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="cinematic"
                    className="text-xs h-9 gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span>{editingId ? "Update Download Link" : "Save Download Link"}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
