"use client";

import React, { useState, useEffect } from "react";
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

  // Active Tab
  const [activeTab, setActiveTab] = useState<"playback" | "download">("playback");

  // Editing Item State
  const [editingPlaybackId, setEditingPlaybackId] = useState<string | null>(null);
  const [editingDownloadId, setEditingDownloadId] = useState<string | null>(null);

  // Form State
  const [sourceName, setSourceName] = useState("Fast HLS Server 1");
  const [streamUrl, setStreamUrl] = useState("");
  const [quality, setQuality] = useState<VideoQuality>("1080p");
  const [language, setLanguage] = useState("English / Bangla Sub");
  const [subtitleUrl, setSubtitleUrl] = useState("");
  const [priority, setPriority] = useState(1);

  // Download Link State
  const [enableDownloadSync, setEnableDownloadSync] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadLabel, setDownloadLabel] = useState("");
  const [fileSizeBytes, setFileSizeBytes] = useState(1572864000);

  const fetchAllSources = async () => {
    if (!contentId) return;
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
      if (!contentId) return;
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
      if (newQuality === "4K") setFileSizeBytes(4294967296);
      else if (newQuality === "1080p") setFileSizeBytes(1610612736);
      else if (newQuality === "720p") setFileSizeBytes(838860800);
      else setFileSizeBytes(524288000);
    }
  };

  // 1. Create or Update Playback Source
  const handleSavePlaybackSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) {
      toast.error("Streaming URL is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingPlaybackId);
      const urlEndpoint = "/api/admin/sources/playback";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        ...(isEditing ? { id: editingPlaybackId } : { content_type: contentType, content_id: contentId }),
        source_name: sourceName,
        url: streamUrl.trim(),
        quality,
        language,
        subtitle_url: subtitleUrl.trim() || null,
        priority,
      };

      const res = await fetch(urlEndpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save streaming playback source.");
      }

      // Optionally Create Download Source sync
      if (!isEditing && enableDownloadSync && downloadUrl.trim()) {
        await fetch("/api/admin/sources/download", {
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
        }).catch(() => {});
      }

      toast.success(isEditing ? "Updated Playback Source!" : "Saved Streaming Playback Source!");
      setStreamUrl("");
      setSubtitleUrl("");
      setEditingPlaybackId(null);
      fetchAllSources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save playback source.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Create or Update Download Source
  const handleSaveDownloadSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadUrl.trim()) {
      toast.error("Download URL is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingDownloadId);
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        ...(isEditing ? { id: editingDownloadId } : { content_type: contentType, content_id: contentId }),
        label: downloadLabel.trim() || `Download (${quality})`,
        url: downloadUrl.trim(),
        quality: quality as DownloadQuality,
        file_size_bytes: fileSizeBytes,
        language,
        priority,
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
      setDownloadUrl("");
      setDownloadLabel("");
      setEditingDownloadId(null);
      fetchAllSources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save download source.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Toggle Playback Active Status
  const handleTogglePlaybackActive = async (source: PlaybackSource) => {
    try {
      const res = await fetch("/api/admin/sources/playback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: source.id, is_active: !source.is_active }),
      });
      if (res.ok) {
        toast.success(`Source ${source.is_active ? "disabled" : "enabled"}.`);
        setPlaybackSources(playbackSources.map((s) => (s.id === source.id ? { ...s, is_active: !s.is_active } : s)));
      }
    } catch {
      toast.error("Failed to toggle source status.");
    }
  };

  // 4. Toggle Download Active Status
  const handleToggleDownloadActive = async (source: DownloadSource) => {
    try {
      const res = await fetch("/api/admin/sources/download", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: source.id, is_active: !source.is_active }),
      });
      if (res.ok) {
        toast.success(`Download link ${source.is_active ? "disabled" : "enabled"}.`);
        setDownloadSources(downloadSources.map((s) => (s.id === source.id ? { ...s, is_active: !s.is_active } : s)));
      }
    } catch {
      toast.error("Failed to toggle download status.");
    }
  };

  // 5. Delete Playback Source
  const handleDeletePlayback = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/sources/playback?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Removed playback source.");
        setPlaybackSources(playbackSources.filter((s) => s.id !== id));
      }
    } catch {
      toast.error("Failed to delete playback source.");
    }
  };

  // 6. Delete Download Source
  const handleDeleteDownload = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/sources/download?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Removed download source.");
        setDownloadSources(downloadSources.filter((s) => s.id !== id));
      }
    } catch {
      toast.error("Failed to delete download source.");
    }
  };

  const startEditPlayback = (s: PlaybackSource) => {
    setEditingPlaybackId(s.id);
    setSourceName(s.source_name);
    setStreamUrl(s.url);
    setQuality(s.quality as VideoQuality);
    setLanguage(s.language || "English / Bangla Sub");
    setSubtitleUrl(s.subtitle_url || "");
    setPriority(s.priority || 1);
    setActiveTab("playback");
  };

  const startEditDownload = (d: DownloadSource) => {
    setEditingDownloadId(d.id);
    setDownloadLabel(d.label);
    setDownloadUrl(d.url);
    setQuality(d.quality as VideoQuality);
    setFileSizeBytes(d.file_size_bytes || 1572864000);
    setPriority(d.priority || 1);
    setActiveTab("download");
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-6 shadow-xl">
      {/* Studio Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Server className="h-5 w-5 text-red-500" /> Media Sources Studio V2
          </h3>
          <p className="text-xs text-text-muted">Manage streaming servers and high-speed download links persisted in PostgreSQL.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("playback")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "playback" ? "bg-red-600 text-white" : "bg-surface-raised text-text-muted hover:text-text-primary"
            }`}
          >
            <Play className="h-3.5 w-3.5" /> Streams ({playbackSources.length})
          </button>
          <button
            onClick={() => setActiveTab("download")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "download" ? "bg-emerald-600 text-white" : "bg-surface-raised text-text-muted hover:text-text-primary"
            }`}
          >
            <Download className="h-3.5 w-3.5" /> Downloads ({downloadSources.length})
          </button>
        </div>
      </div>

      {/* Form Area */}
      {activeTab === "playback" ? (
        <form onSubmit={handleSavePlaybackSource} className="space-y-4 p-4 rounded-xl bg-surface-raised/50 border border-border">
          <div className="flex items-center justify-between text-xs font-bold text-text-primary">
            <span>{editingPlaybackId ? "Edit Streaming Source" : "Add New Streaming Source"}</span>
            {editingPlaybackId && (
              <button onClick={() => setEditingPlaybackId(null)} type="button" className="text-text-muted hover:text-text-primary">
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">Server Name</label>
              <Input value={sourceName} onChange={(e) => setSourceName(e.target.value)} required className="h-9 text-xs" />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">Quality</label>
              <select
                value={quality}
                onChange={(e) => handleQualityChange(e.target.value as VideoQuality)}
                className="w-full h-9 px-3 rounded-lg text-xs font-bold bg-surface-base border border-border text-text-primary"
              >
                <option value="4K">4K Ultra HD</option>
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-text-muted block mb-1">Stream URL (HLS / MP4 / Embed)</label>
            <Input value={streamUrl} onChange={(e) => handleStreamUrlChange(e.target.value)} required placeholder="https://..." className="h-9 text-xs font-mono" />
          </div>

          <div className="flex items-center justify-between pt-2">
            {!editingPlaybackId && (
              <label className="flex items-center gap-2 text-xs text-text-muted font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDownloadSync}
                  onChange={(e) => setEnableDownloadSync(e.target.checked)}
                  className="rounded border-border accent-red-600"
                />
                Auto-generate matching Download Link
              </label>
            )}

            <Button type="submit" disabled={isSubmitting} variant="cinematic" className="ml-auto text-xs h-9 gap-1.5">
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{editingPlaybackId ? "Update Streaming Source" : "Save Streaming Source"}</span>
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveDownloadSource} className="space-y-4 p-4 rounded-xl bg-surface-raised/50 border border-border">
          <div className="flex items-center justify-between text-xs font-bold text-text-primary">
            <span>{editingDownloadId ? "Edit Download Link" : "Add Direct Download Link"}</span>
            {editingDownloadId && (
              <button onClick={() => setEditingDownloadId(null)} type="button" className="text-text-muted hover:text-text-primary">
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">Display Label</label>
              <Input value={downloadLabel} onChange={(e) => setDownloadLabel(e.target.value)} required placeholder="e.g. Direct Fast Server (1080p)" className="h-9 text-xs" />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">Quality</label>
              <select
                value={quality}
                onChange={(e) => handleQualityChange(e.target.value as VideoQuality)}
                className="w-full h-9 px-3 rounded-lg text-xs font-bold bg-surface-base border border-border text-text-primary"
              >
                <option value="4K">4K Ultra HD</option>
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-text-muted block mb-1">Direct Download URL</label>
            <Input value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} required placeholder="https://..." className="h-9 text-xs font-mono" />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} variant="cinematic" className="text-xs h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{editingDownloadId ? "Update Download Link" : "Save Download Link"}</span>
            </Button>
          </div>
        </form>
      )}

      {/* Sources List Area */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Configured {activeTab === "playback" ? "Streaming Servers" : "Download Links"}
        </h4>

        {isLoading ? (
          <div className="p-6 text-center text-xs text-text-muted flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-red-500" /> Loading persisted sources from Supabase...
          </div>
        ) : activeTab === "playback" ? (
          playbackSources.length === 0 ? (
            <p className="text-xs text-text-muted p-4 rounded-xl bg-surface-raised/30 border border-border text-center">No streaming sources saved yet.</p>
          ) : (
            <div className="space-y-2">
              {playbackSources.map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <button onClick={() => handleTogglePlaybackActive(s)} className="p-1 rounded text-text-muted hover:text-text-primary">
                      {s.is_active ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                    </button>
                    <div className="truncate">
                      <div className="font-bold text-text-primary flex items-center gap-2">
                        <span>{s.source_name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-600/10 text-red-400 font-mono">{s.quality}</span>
                      </div>
                      <p className="text-[11px] text-text-muted font-mono truncate max-w-sm">{s.url}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEditPlayback(s)} className="p-1.5 rounded-lg text-text-muted hover:text-amber-400 hover:bg-surface-base">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDeletePlayback(s.id)} className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-surface-base">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : downloadSources.length === 0 ? (
          <p className="text-xs text-text-muted p-4 rounded-xl bg-surface-raised/30 border border-border text-center">No download links saved yet.</p>
        ) : (
          <div className="space-y-2">
            {downloadSources.map((d) => (
              <div key={d.id} className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3 truncate">
                  <button onClick={() => handleToggleDownloadActive(d)} className="p-1 rounded text-text-muted hover:text-text-primary">
                    {d.is_active ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                  </button>
                  <div className="truncate">
                    <div className="font-bold text-text-primary flex items-center gap-2">
                      <span>{d.label}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-600/10 text-emerald-400 font-mono">{d.quality}</span>
                    </div>
                    <p className="text-[11px] text-text-muted font-mono truncate max-w-sm">{d.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEditDownload(d)} className="p-1.5 rounded-lg text-text-muted hover:text-amber-400 hover:bg-surface-base">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDeleteDownload(d.id)} className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-surface-base">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
