"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Tv,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaybackSource, ContentSourceType, VideoQuality } from "@/types/sources";
import { toast } from "sonner";

interface PlaybackSourceManagerProps {
  contentType: ContentSourceType;
  contentId: string;
}

export function PlaybackSourceManager({
  contentType,
  contentId,
}: PlaybackSourceManagerProps) {
  const [sources, setSources] = useState<PlaybackSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [sourceName, setSourceName] = useState("Fast CDN Server 1");
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState<VideoQuality>("1080p");
  const [language, setLanguage] = useState("English / Bangla Sub");
  const [subtitleUrl, setSubtitleUrl] = useState("");
  const [priority, setPriority] = useState(1);

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/sources/playback?content_type=${contentType}&content_id=${contentId}`
      );
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources || []);
      }
    } catch (err) {
      console.error("Failed to fetch playback sources:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/admin/sources/playback?content_type=${contentType}&content_id=${contentId}`
        );
        const data = await res.json();
        if (isMounted && res.ok) {
          setSources(data.sources || []);
        }
      } catch (err) {
        console.error("Failed to fetch playback sources:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [contentType, contentId]);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Source URL is required.");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/sources/playback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          source_name: sourceName,
          url: url.trim(),
          quality,
          language,
          subtitle_url: subtitleUrl.trim() || null,
          priority,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add playback source.");
      }

      toast.success(`Added playback source "${sourceName}"!`);
      setUrl("");
      setSubtitleUrl("");
      fetchSources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add playback source.";
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/sources/playback?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Removed playback source.");
        setSources(sources.filter((s) => s.id !== id));
      } else {
        toast.error("Failed to delete source.");
      }
    } catch {
      toast.error("Failed to delete playback source.");
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/10 text-red-500 font-bold border border-red-500/20">
            <Tv className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-text-primary">
              Streaming Playback Sources
            </h3>
            <p className="text-xs text-text-muted">
              Manually manage authorized streaming servers, qualities, and subtitle references.
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-surface-raised border border-border text-text-secondary">
          {sources.length} active sources
        </span>
      </div>

      {/* Existing Sources Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-raised font-bold uppercase tracking-wider text-text-muted border-b border-border">
            <tr>
              <th className="p-3">Priority</th>
              <th className="p-3">Source Name</th>
              <th className="p-3">Quality</th>
              <th className="p-3">Language</th>
              <th className="p-3">URL</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-text-muted">
                  Loading playback sources...
                </td>
              </tr>
            ) : sources.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-text-muted">
                  No streaming sources added yet. Fill out the form below to add a source.
                </td>
              </tr>
            ) : (
              sources.map((s) => (
                <tr key={s.id} className="hover:bg-surface-raised/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-red-400">{s.priority}</td>
                  <td className="p-3 font-bold text-text-primary">{s.source_name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-mono font-bold text-[10px] border border-red-500/30">
                      {s.quality}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary">{s.language}</td>
                  <td className="p-3 text-text-muted font-mono text-[11px] truncate max-w-[200px]">
                    {s.url}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-purple-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Test
                    </a>
                    <button
                      onClick={() => handleDeleteSource(s.id)}
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

      {/* Add New Source Form */}
      <form onSubmit={handleAddSource} className="p-5 rounded-xl bg-surface-raised border border-border space-y-4">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Plus className="h-4 w-4 text-emerald-400" />
          Add Authorized Playback Link
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Server Name</label>
            <Input
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. Fast CDN Server 1"
              className="h-8 text-xs bg-surface-base border-border"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Stream Quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as VideoQuality)}
              className="w-full h-8 px-2 rounded-lg text-xs font-semibold bg-surface-base border border-border text-text-primary"
            >
              <option value="1080p">1080p Full HD</option>
              <option value="4K">4K Ultra HD</option>
              <option value="720p">720p HD</option>
              <option value="480p">480p SD</option>
              <option value="Auto">Auto Adaptive</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Language / Audio</label>
            <Input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. English / Bangla Sub"
              className="h-8 text-xs bg-surface-base border-border"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-text-muted">Streaming URL (.m3u8, .mp4, or Embed URL)</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://cdn.example.com/hls/movie.m3u8"
            className="h-8 text-xs bg-surface-base border-border font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
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

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isAdding}
            size="sm"
            variant="cinematic"
            className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
          >
            {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Save Playback Source
          </Button>
        </div>
      </form>
    </div>
  );
}
