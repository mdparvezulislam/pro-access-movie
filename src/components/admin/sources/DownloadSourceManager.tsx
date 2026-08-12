"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadSource, ContentSourceType, DownloadQuality } from "@/types/sources";
import { toast } from "sonner";

interface DownloadSourceManagerProps {
  contentType: ContentSourceType;
  contentId: string;
}

export function DownloadSourceManager({
  contentType,
  contentId,
}: DownloadSourceManagerProps) {
  const [sources, setSources] = useState<DownloadSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [label, setLabel] = useState("Direct High-Speed Download (1080p)");
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState<DownloadQuality>("1080p");
  const [fileSizeBytes, setFileSizeBytes] = useState(1572864000); // 1.5GB
  const [language, setLanguage] = useState("English Dual Audio");
  const [priority, setPriority] = useState(1);

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/sources/download?content_type=${contentType}&content_id=${contentId}`
      );
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources || []);
      }
    } catch (err) {
      console.error("Failed to fetch download sources:", err);
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
          `/api/admin/sources/download?content_type=${contentType}&content_id=${contentId}`
        );
        const data = await res.json();
        if (isMounted && res.ok) {
          setSources(data.sources || []);
        }
      } catch (err) {
        console.error("Failed to fetch download sources:", err);
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
      toast.error("Download URL is required.");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/sources/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          label,
          url: url.trim(),
          quality,
          file_size_bytes: fileSizeBytes,
          language,
          priority,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add download link.");
      }

      toast.success(`Added download link "${label}"!`);
      setUrl("");
      fetchSources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add download link.";
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/sources/download?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Removed download link.");
        setSources(sources.filter((s) => s.id !== id));
      } else {
        toast.error("Failed to delete source.");
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
    <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-text-primary">
              Download Sources
            </h3>
            <p className="text-xs text-text-muted">
              Manually manage direct download links, qualities, and file sizes for users.
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-surface-raised border border-border text-text-secondary">
          {sources.length} active links
        </span>
      </div>

      {/* Sources Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-raised font-bold uppercase tracking-wider text-text-muted border-b border-border">
            <tr>
              <th className="p-3">Priority</th>
              <th className="p-3">Label</th>
              <th className="p-3">Quality</th>
              <th className="p-3">File Size</th>
              <th className="p-3">Language</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-text-muted">
                  Loading download links...
                </td>
              </tr>
            ) : sources.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-text-muted">
                  No download links added yet. Use the form below to create authorized links.
                </td>
              </tr>
            ) : (
              sources.map((s) => (
                <tr key={s.id} className="hover:bg-surface-raised/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-indigo-400">{s.priority}</td>
                  <td className="p-3 font-bold text-text-primary">{s.label}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 font-mono font-bold text-[10px] border border-indigo-500/30">
                      {s.quality}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary font-mono">
                    {formatBytes(s.file_size_bytes)}
                  </td>
                  <td className="p-3 text-text-muted">{s.language}</td>
                  <td className="p-3 text-text-right space-x-2">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Test Link
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

      {/* Add New Download Link Form */}
      <form onSubmit={handleAddSource} className="p-5 rounded-xl bg-surface-raised border border-border space-y-4">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Plus className="h-4 w-4 text-indigo-400" />
          Add Authorized Download Link
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Display Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 1080p WEB-DL Direct Link"
              className="h-8 text-xs bg-surface-base border-border"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Format / Quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as DownloadQuality)}
              className="w-full h-8 px-2 rounded-lg text-xs font-semibold bg-surface-base border border-border text-text-primary"
            >
              <option value="1080p">1080p Full HD</option>
              <option value="WEB-DL">WEB-DL Rip</option>
              <option value="720p">720p HD</option>
              <option value="4K">4K UHD</option>
              <option value="480p">480p SD</option>
              <option value="BD-Rip">BD-Rip</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Audio / Subtitle</label>
            <Input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. Dual Audio (Eng + Ban)"
              className="h-8 text-xs bg-surface-base border-border"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-text-muted">Direct Download URL</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://downloads.example.com/files/movie_1080p.mkv"
            className="h-8 text-xs bg-surface-base border-border font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">File Size (Bytes)</label>
            <Input
              type="number"
              value={fileSizeBytes}
              onChange={(e) => setFileSizeBytes(Number(e.target.value))}
              className="h-8 text-xs bg-surface-base border-border font-mono"
            />
            <span className="text-[10px] text-text-muted">
              Estimated: {formatBytes(fileSizeBytes)}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted">Priority Order (1 = Highest)</label>
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
            className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
          >
            {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Save Download Source
          </Button>
        </div>
      </form>
    </div>
  );
}
